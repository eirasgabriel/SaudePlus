package br.com.saudeplus.security;

import java.util.UUID;

import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;

/**
 * Quem está chamando a API, já conferido contra o banco. Controllers recebem
 * com `@AuthenticationPrincipal UsuarioAutenticado usuario` — é daqui, e nunca
 * do caminho da URL, que sai o dono dos dados de paciente e médico.
 */
public record UsuarioAutenticado(UUID id, String email, String nome, Papel papel) {

    static UsuarioAutenticado de(Usuario usuario) {
        return new UsuarioAutenticado(usuario.getId(), usuario.getEmail(), usuario.getNomeCompleto(), usuario.getPapel());
    }
}
