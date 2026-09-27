import { requisitar } from '../../services/http.js'

/** Chamadas de autenticacao. Espelham br.com.saudeplus.auth.AuthController. */

/** POST /api/auth/login — serve para paciente, medico e admin. */
export function autenticar({ email, senha }) {
  return requisitar('/auth/login', {
    metodo: 'POST',
    corpo: { email, senha },
  })
}

/**
 * POST /api/auth/cadastro — cria somente paciente.
 * O perfil e definido pelo servidor; nao existe rota publica para medico ou admin.
 */
export function cadastrarPaciente({ nomeCompleto, email, senha, telefone, aceiteTermos }) {
  return requisitar('/auth/cadastro', {
    metodo: 'POST',
    corpo: { nomeCompleto, email, senha, telefone, aceiteTermos },
  })
}

/**
 * POST /api/auth/recuperar-senha — dispara o e-mail com o link de redefinição.
 *
 * Responde 200 com a mesma mensagem exista ou não a conta, de propósito: a rota
 * não serve para descobrir quais e-mails estão cadastrados.
 */
export function solicitarRecuperacaoDeSenha({ email }) {
  return requisitar('/auth/recuperar-senha', {
    metodo: 'POST',
    corpo: { email },
  })
}

/** POST /api/auth/redefinir-senha — grava a nova senha usando o token do link. */
export function redefinirSenha({ token, senha }) {
  return requisitar('/auth/redefinir-senha', {
    metodo: 'POST',
    corpo: { token, senha },
  })
}

/** GET /api/auth/perfil — revalida o token guardado no navegador. */
export function buscarPerfil() {
  return requisitar('/auth/perfil', { autenticado: true })
}
