package br.com.saudeplus.auth.dto;

public record AuthResponse(String token, String tipo, long expiraEmSegundos, UsuarioResponse usuario) {

	public static AuthResponse bearer(String token, long expiraEmSegundos, UsuarioResponse usuario) {
		return new AuthResponse(token, "Bearer", expiraEmSegundos, usuario);
	}
}
