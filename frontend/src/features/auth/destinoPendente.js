/**
 * Para onde voltar depois do login.
 *
 * Quando um visitante abre uma rota protegida (ex.: "Agendar consulta" no
 * perfil de um profissional), `RotaProtegida` guarda o endereço antes de
 * mandar para o login. Depois de entrar ou criar a conta, `rotaInicialDe`
 * devolve esse endereço em vez da área inicial do perfil, se o perfil de quem
 * entrou puder abri-lo. Quem chega ao destino o descarta.
 *
 * Fica no sessionStorage (some ao fechar a aba) e vale por 30 minutos: um
 * login bem depois não deve cair numa tela que a pessoa já esqueceu.
 */

const CHAVE = 'saudeplus:destino'
export const VALIDADE_MS = 30 * 60 * 1000

function sessao() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/** Só caminhos internos: "//site.com" ou "https://…" viram redirecionamento aberto. */
function caminhoInterno(caminho) {
  return typeof caminho === 'string' && caminho.startsWith('/') && !caminho.startsWith('//')
}

function ler(armazenamento) {
  try {
    return JSON.parse(armazenamento?.getItem(CHAVE) ?? 'null')
  } catch {
    return null
  }
}

export function guardarDestino(caminho, perfis, { armazenamento = sessao(), agora = Date.now() } = {}) {
  if (!caminhoInterno(caminho)) return
  try {
    armazenamento?.setItem(CHAVE, JSON.stringify({ caminho, perfis: perfis ?? null, guardadoEm: agora }))
  } catch {
    /* sem storage, o login só leva para a área inicial */
  }
}

/** O destino guardado, se ainda vale e se `usuario` pode abri-lo; senão `null`. */
export function destinoPendente(usuario, { armazenamento = sessao(), agora = Date.now() } = {}) {
  const destino = ler(armazenamento)
  if (!destino || !usuario || !caminhoInterno(destino.caminho)) return null
  if (!(agora - destino.guardadoEm >= 0 && agora - destino.guardadoEm < VALIDADE_MS)) return null
  if (destino.perfis && !destino.perfis.includes(usuario.role)) return null
  return destino.caminho
}

/** Esquece o destino; com `caminho`, só se for ele (quem chegou lá). */
export function descartarDestino(caminho, { armazenamento = sessao() } = {}) {
  if (caminho !== undefined && ler(armazenamento)?.caminho !== caminho) return
  try {
    armazenamento?.removeItem(CHAVE)
  } catch {
    /* nada a limpar */
  }
}
