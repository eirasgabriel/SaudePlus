/* Infraestrutura compartilhada de acesso HTTP.
   As chamadas de cada domínio ficam na própria funcionalidade, por exemplo
   `features/medico/medico.api.js` — aqui só mora o que é comum a todas. */

/** Base da API. Configurável por `VITE_API_URL` (veja `.env.example`). */
export const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8080";

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
  }

  /** true quando a requisição nem chegou ao servidor (rede, CORS, timeout). */
  get offline() {
    return this.status === 0;
  }
}

function montarUrl(caminho, parametros) {
  const url = new URL(caminho.replace(/^\//, ""), `${API_URL.replace(/\/$/, "")}/`);
  for (const [chave, valor] of Object.entries(parametros ?? {})) {
    if (valor !== undefined && valor !== null && valor !== "") {
      url.searchParams.set(chave, String(valor));
    }
  }
  return url.toString();
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
export async function requisitar(caminho, { metodo = "GET", corpo, parametros, sinal } = {}) {
  const url = montarUrl(caminho, parametros);
  const controle = new AbortController();
  const expirar = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  // Cancelamento de quem chamou (troca de tela) também aborta a requisição.
  sinal?.addEventListener("abort", () => controle.abort(), { once: true });

  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers: {
        Accept: "application/json",
        ...(corpo === undefined ? {} : { "Content-Type": "application/json" }),
      },
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
