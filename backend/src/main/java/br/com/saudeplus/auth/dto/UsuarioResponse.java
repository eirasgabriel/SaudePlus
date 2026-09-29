package br.com.saudeplus.auth.dto;

import br.com.saudeplus.auth.Role;
import br.com.saudeplus.auth.Usuario;

/** Dados publicos do usuario. Nunca inclui a senha. */
public record UsuarioResponse(Long id, String nomeCompleto, String email, String telefone, Role role) {

	public static UsuarioResponse de(Usuario u) {
		return new UsuarioResponse(u.getId(), u.getNomeCompleto(), u.getEmail(), u.getTelefone(), u.getRole());
	}
}
