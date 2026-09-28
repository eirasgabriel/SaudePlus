package br.com.saudeplus.auth.dto;

import java.util.UUID;

import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;

/** O front decide a área inicial por `role` (PACIENTE, MEDICO, ADMIN). */
public record UsuarioResposta(UUID id, String nomeCompleto, String email, String telefone, Papel role, String fotoUrl) {

    public static UsuarioResposta de(Usuario usuario) {
        return new UsuarioResposta(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getPapel(),
                usuario.getFotoUrl());
    }
}
