/**
 * Guarda o token de acesso no navegador.
 *
 * Com "Lembrar de mim" marcado o token vai para o localStorage e sobrevive ao
 * fechamento do navegador. Sem a marcacao ele fica no sessionStorage e some
 * quando a aba e fechada.
 *
 * Todo acesso ao storage e protegido: em janela anonima ou com cookies
 * bloqueados, ler ou escrever pode lancar excecao.
 */

const CHAVE_TOKEN = 'saudeplus:token'

function armazenamentos() {
  const lista = []
  try {
    lista.push(window.localStorage)
  } catch {
    /* indisponivel */
  }
  try {
    lista.push(window.sessionStorage)
  } catch {
    /* indisponivel */
  }
  return lista
}

export function lerToken() {
  for (const armazenamento of armazenamentos()) {
    try {
      const token = armazenamento.getItem(CHAVE_TOKEN)
      if (token) {
        return token
      }
    } catch {
      /* ignora e tenta o proximo */
    }
  }
  return null
}

export function salvarToken(token, { lembrar = true } = {}) {
  limparToken()
  try {
    const destino = lembrar ? window.localStorage : window.sessionStorage
    destino.setItem(CHAVE_TOKEN, token)
  } catch {
    // Sem storage o usuario continua logado apenas nesta navegacao em memoria.
  }
}

export function limparToken() {
  for (const armazenamento of armazenamentos()) {
    try {
      armazenamento.removeItem(CHAVE_TOKEN)
    } catch {
      /* ignora */
    }
  }
}
