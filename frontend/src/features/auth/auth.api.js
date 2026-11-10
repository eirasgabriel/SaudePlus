import { API_URL, ErroDeApi, requisitar } from '../../services/http.js'
import { lerToken } from '../../services/sessaoStorage.js'

/** Chamadas de autenticacao. Espelham br.com.saudeplus.auth.AuthController. */

/** POST /api/auth/login — serve para paciente, medico e admin. */
export function autenticar({ email, senha }) {
  return requisitar('/api/auth/login', {
    metodo: 'POST',
    corpo: { email, senha },
  })
}

/**
 * POST /api/auth/cadastro — cria somente paciente.
 * O perfil e definido pelo servidor; nao existe rota publica para medico ou admin.
 */
export function cadastrarPaciente({ nomeCompleto, email, senha, telefone, aceiteTermos }) {
  return requisitar('/api/auth/cadastro', {
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
  return requisitar('/api/auth/recuperar-senha', {
    metodo: 'POST',
    corpo: { email },
  })
}

/** POST /api/auth/redefinir-senha — grava a nova senha usando o token do link. */
export function redefinirSenha({ token, senha }) {
  return requisitar('/api/auth/redefinir-senha', {
    metodo: 'POST',
    corpo: { token, senha },
  })
}

/** GET /api/auth/perfil — revalida o token guardado no navegador. */
export function buscarPerfil() {
  return requisitar('/api/auth/perfil', { autenticado: true })
}

/**
 * PUT /api/auth/perfil — nome, telefone e foto de quem está logado.
 * `exibirFotoNoPainel` (opcional) mostra a foto na página principal do painel.
 */
export function atualizarPerfil({ nomeCompleto, telefone, fotoUrl, exibirFotoNoPainel }) {
  return requisitar('/api/auth/perfil', {
    metodo: 'PUT',
    corpo: { nomeCompleto, telefone, fotoUrl, exibirFotoNoPainel },
    autenticado: true,
  })
}

/** Tamanho máximo da foto enviada do computador (o back-end confere de novo). */
export const TAMANHO_MAXIMO_DA_FOTO = 2 * 1024 * 1024

/**
 * POST /api/auth/perfil/foto — envia uma imagem (PNG, JPG ou WebP) do computador e a
 * transforma na foto do perfil. Devolve o usuário atualizado.
 */
export async function enviarFotoDePerfil(arquivo) {
  const dados = new FormData()
  dados.append('arquivo', arquivo)
  const url = `${API_URL.replace(/\/$/, '')}/api/auth/perfil/foto`
  const token = lerToken()
  let resposta
  try {
    resposta = await fetch(url, {
      method: 'POST',
      body: dados,
      headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' },
    })
  } catch {
    throw new ErroDeApi('Não foi possível falar com o servidor.', { status: 0, url })
  }
  const corpo = await resposta.json().catch(() => null)
  if (!resposta.ok) {
    throw new ErroDeApi(corpo?.mensagem ?? 'Não foi possível enviar a foto.', { status: resposta.status, corpo, url })
  }
  return corpo
}

/** PUT /api/auth/senha — senha atual errada responde 400 no campo `senhaAtual`. */
export function trocarSenha({ senhaAtual, novaSenha }) {
  return requisitar('/api/auth/senha', {
    metodo: 'PUT',
    corpo: { senhaAtual, novaSenha },
    autenticado: true,
  })
}
