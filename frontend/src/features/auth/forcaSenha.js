/**
 * Classifica a força de uma senha em fraca, média ou forte.
 *
 * É só uma orientação para quem está criando a conta: quem decide se a senha
 * é aceita é o back-end (hoje, no mínimo 8 caracteres).
 *
 * Pontos: 8+ caracteres, 12+ caracteres, letras maiúsculas e minúsculas,
 * números e símbolos. Com menos de 8 caracteres é sempre fraca.
 *
 * @param {string} senha
 * @returns {null | {nivel: 'fraca' | 'media' | 'forte', rotulo: string}}
 *          null quando o campo está vazio
 */
export function avaliarForcaSenha(senha) {
  if (!senha) {
    return null
  }

  const temMaiuscula = /\p{Lu}/u.test(senha)
  const temMinuscula = /\p{Ll}/u.test(senha)
  const temNumero = /\d/.test(senha)
  const temSimbolo = /[^\p{L}\d]/u.test(senha)

  if (senha.length < 8) {
    return { nivel: 'fraca', rotulo: 'Senha fraca' }
  }

  const pontos =
    1 +
    (senha.length >= 12 ? 1 : 0) +
    (temMaiuscula && temMinuscula ? 1 : 0) +
    (temNumero ? 1 : 0) +
    (temSimbolo ? 1 : 0)

  if (pontos >= 4) {
    return { nivel: 'forte', rotulo: 'Senha forte' }
  }

  if (pontos === 3) {
    return { nivel: 'media', rotulo: 'Senha média' }
  }

  return { nivel: 'fraca', rotulo: 'Senha fraca' }
}
