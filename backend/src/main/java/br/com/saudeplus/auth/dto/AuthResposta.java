package br.com.saudeplus.auth.dto;

public record AuthResposta(String token, String tipo, long expiraEmSegundos, UsuarioResposta usuario) {

    public static AuthResposta bearer(String token, long expiraEmSegundos, UsuarioResposta usuario) {
        return new AuthResposta(token, "Bearer", expiraEmSegundos, usuario);
    }
}
