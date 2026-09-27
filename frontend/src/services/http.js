import { lerToken } from './sessaoStorage.js'

/**
 * Infraestrutura compartilhada de acesso HTTP.
 *
 * Em desenvolvimento o Vite faz proxy de /api para o back-end na porta 8080
 * (ver vite.config.js). Em outro ambiente, defina VITE_API_URL.
 */

const URL_BASE = import.meta.env.VITE_API_URL ?? '/api'

/** Erro de API com o status e os erros por campo devolvidos pelo back-end. */
export class ErroHttp extends Error {
  constructor(mensagem, { status = 0, campos = {} } = {}) {
    super(mensagem)
    this.name = 'ErroHttp'
    this.status = status
    this.campos = campos
  }
}

function interpretarJson(texto) {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

export async function requisitar(caminho, { metodo = 'GET', corpo, autenticado = false } = {}) {
  const cabecalhos = { Accept: 'application/json' }

  if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json'
  }

  if (autenticado) {
    const token = lerToken()
    if (token) {
      cabecalhos.Authorization = `Bearer ${token}`
    }
  }

  let resposta
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    })
  } catch {
    throw new ErroHttp(
      'Nao foi possivel falar com o servidor. Verifique se a API esta no ar e tente novamente.',
      { status: 0 },
    )
  }

  if (resposta.status === 204) {
    return null
  }

  const texto = await resposta.text()
  const dados = texto ? interpretarJson(texto) : null

  if (!resposta.ok) {
    throw new ErroHttp(dados?.mensagem ?? 'Nao foi possivel concluir a operacao.', {
      status: resposta.status,
      campos: dados?.campos ?? {},
    })
  }

  return dados
}
