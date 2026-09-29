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
  const preenchido = (valor) => valor !== undefined && valor !== null && valor !== "";
  for (const [chave, valor] of Object.entries(parametros ?? {})) {
    // Lista vira o parâmetro repetido (?especialidade=a&especialidade=b).
    if (Array.isArray(valor)) {
      valor.filter(preenchido).forEach((item) => busca.append(chave, String(item)));
    } else if (preenchido(valor)) {
      busca.set(chave, String(valor));
    }
  }
  const consulta = busca.toString();
  return `${base}/${caminho.replace(/^\//, "")}${consulta ? `?${consulta}` : ""}`;
}

/* Quem avisar quando o servidor recusa o token (401 numa chamada
   autenticada: sessão expirada, conta bloqueada). O AuthProvider registra
   aqui o logout; sem isso, as telas ficariam logadas mostrando erro. */
let aoRecusarSessao = null;

/** Registra o aviso de sessão recusada; devolve a função que o remove. */
export function definirAoRecusarSessao(funcao) {
  aoRecusarSessao = funcao;
  return () => {
    if (aoRecusarSessao === funcao) aoRecusarSessao = null;
  };
}

function avisarSeSessaoRecusada(status, autenticado) {
  if (status === 401 && autenticado && lerToken()) aoRecusarSessao?.();
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
    avisarSeSessaoRecusada(resposta.status, autenticado);
    const mensagem =
      (dados && typeof dados === "object" && dados.mensagem) ||
      `A requisição falhou com status ${resposta.status}.`;
    throw new ErroDeApi(mensagem, { status: resposta.status, corpo: dados, url });
  }

  return dados;
}

/** "attachment; filename=\"resultado.pdf\"" → "resultado.pdf". */
function nomeDoAnexo(disposicao) {
  const encontrado = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposicao ?? "");
  return encontrado ? decodeURIComponent(encontrado[1]) : null;
}

/**
 * Baixa um arquivo protegido (resultado de exame) e oferece para salvar.
 *
 * Um `<a href>` comum não mandaria o token, por isso o arquivo vem por
 * `fetch` com `Authorization` e é entregue ao navegador como blob.
 * Erros chegam como `ErroDeApi`, igual às demais chamadas.
 */
export async function baixarArquivo(caminho, { nomePadrao = "arquivo", sinal } = {}) {
  const url = montarUrl(caminho);
  const controle = new AbortController();
  sinal?.addEventListener("abort", () => controle.abort(), { once: true });

  let resposta;
  try {
    resposta = await fetch(url, { headers: cabecalhos(undefined, true), signal: controle.signal });
  } catch {
    throw new ErroDeApi("Não foi possível falar com o servidor.", { status: 0, url });
  }
  if (!resposta.ok) {
    avisarSeSessaoRecusada(resposta.status, true);
    const dados = await lerCorpo(resposta);
    const mensagem = (dados && typeof dados === "object" && dados.mensagem) || "Não foi possível baixar o arquivo.";
    throw new ErroDeApi(mensagem, { status: resposta.status, corpo: dados, url });
  }

  const blob = await resposta.blob();
  const endereco = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = endereco;
  link.download = nomeDoAnexo(resposta.headers.get("content-disposition")) ?? nomePadrao;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Dá tempo ao navegador de iniciar o download antes de liberar a memória.
  setTimeout(() => URL.revokeObjectURL(endereco), 1000);
}

export const http = {
  get: (caminho, opcoes) => requisitar(caminho, { ...opcoes, metodo: "GET" }),
  post: (caminho, corpo, opcoes) => requisitar(caminho, { ...opcoes, metodo: "POST", corpo }),
  patch: (caminho, corpo, opcoes) => requisitar(caminho, { ...opcoes, metodo: "PATCH", corpo }),
  put: (caminho, corpo, opcoes) => requisitar(caminho, { ...opcoes, metodo: "PUT", corpo }),
  remover: (caminho, opcoes) => requisitar(caminho, { ...opcoes, metodo: "DELETE" }),
};
