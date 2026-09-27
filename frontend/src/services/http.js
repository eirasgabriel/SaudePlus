/* Infraestrutura compartilhada de acesso HTTP.
   As chamadas de cada domínio ficam na própria funcionalidade, por exemplo
   `features/medico/medico.api.js` — aqui só mora o que é comum a todas.

   Unifica os dois `http.js` das branches do médico e do login: timeout,
   cancelamento e `offline` vieram do médico; o token (`autenticado`) e os
   erros por campo (`campos`) vieram do login. */

import { lerToken } from "./sessaoStorage.js";

/**
 * Base da API. Vazia por padrão: os caminhos já começam com `/api` e, em
 * desenvolvimento, o Vite faz proxy de `/api` para o Spring Boot na 8080
 * (ver vite.config.js). Para outro servidor, defina `VITE_API_URL`.
 */
export const API_URL = import.meta.env?.VITE_API_URL ?? "";

/** Quanto tempo esperar antes de desistir de uma requisição. */
const TEMPO_LIMITE_MS = 8000;

/**
 * Erro de API com o status e o corpo já lidos.
 * O back-end responde todo erro no mesmo formato (veja `ErroResposta.java`),
 * então `corpo.mensagem` costuma trazer um texto pronto para exibir.
 */
export class ErroDeApi extends Error {
  constructor(mensagem, { status, corpo, url } = {}) {
    super(mensagem);
    this.name = "ErroDeApi";
    this.status = status ?? 0;
    this.corpo = corpo ?? null;
    this.url = url ?? "";
    this.campos = normalizarCampos(corpo?.campos);
  }

  /** true quando a requisição nem chegou ao servidor (rede, CORS, timeout). */
  get offline() {
    return this.status === 0;
  }
}

/** Nome usado pelas telas de autenticação. */
export { ErroDeApi as ErroHttp };

/**
 * Erros por campo como `{ campo: mensagem }`, que é o que os formulários leem.
 * O back-end do painel do médico devolve uma lista `[{ campo, mensagem }]`;
 * o contrato de auth (docs/api.md) prevê um objeto. Aceita os dois.
 */
function normalizarCampos(campos) {
  if (Array.isArray(campos)) {
    return Object.fromEntries(campos.map((item) => [item.campo, item.mensagem]));
  }
  return campos && typeof campos === "object" ? campos : {};
}

function montarUrl(caminho, parametros) {
  const base = API_URL.replace(/\/$/, "");
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros ?? {})) {
    if (valor !== undefined && valor !== null && valor !== "") {
      busca.set(chave, String(valor));
    }
  }
  const consulta = busca.toString();
  return `${base}/${caminho.replace(/^\//, "")}${consulta ? `?${consulta}` : ""}`;
}

function cabecalhos(corpo, autenticado) {
  const lista = { Accept: "application/json" };
  if (corpo !== undefined) {
    lista["Content-Type"] = "application/json";
  }
  const token = autenticado ? lerToken() : null;
  if (token) {
    lista.Authorization = `Bearer ${token}`;
  }
  return lista;
}

async function lerCorpo(resposta) {
  const tipo = resposta.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    const texto = await resposta.text();
    return texto || null;
  }
  try {
    return await resposta.json();
  } catch {
    // 204, ou corpo vazio anunciado como JSON.
    return null;
  }
}

/**
 * Faz a requisição e devolve o corpo já convertido.
 *
 * Lança `ErroDeApi` tanto para status de erro quanto para falha de rede —
 * quem chama trata os dois casos no mesmo `catch`, e `erro.offline`
 * distingue "o servidor recusou" de "o servidor não respondeu".
 */
export async function requisitar(caminho, { metodo = "GET", corpo, parametros, sinal, autenticado = false } = {}) {
  const url = montarUrl(caminho, parametros);
  const controle = new AbortController();
  const expirar = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  // Cancelamento de quem chamou (troca de tela) também aborta a requisição.
  sinal?.addEventListener("abort", () => controle.abort(), { once: true });

  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers: cabecalhos(corpo, autenticado),
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: controle.signal,
    });
  } catch (causa) {
    throw new ErroDeApi(
      causa?.name === "AbortError"
        ? "A requisição demorou demais e foi cancelada."
        : "Não foi possível falar com o servidor.",
      { status: 0, url },
    );
  } finally {
    clearTimeout(expirar);
  }

  const dados = await lerCorpo(resposta);

  if (!resposta.ok) {
    const mensagem =
      (dados && typeof dados === "object" && dados.mensagem) ||
      `A requisição falhou com status ${resposta.status}.`;
    throw new ErroDeApi(mensagem, { status: resposta.status, corpo: dados, url });
  }

  return dados;
}

export const http = {
  get: (caminho, opcoes) => requisitar(caminho, { ...opcoes, metodo: "GET" }),
  post: (caminho, corpo, opcoes) => requisitar(caminho, { ...opcoes, metodo: "POST", corpo }),
  patch: (caminho, corpo, opcoes) => requisitar(caminho, { ...opcoes, metodo: "PATCH", corpo }),
  put: (caminho, corpo, opcoes) => requisitar(caminho, { ...opcoes, metodo: "PUT", corpo }),
  remover: (caminho, opcoes) => requisitar(caminho, { ...opcoes, metodo: "DELETE" }),
};
