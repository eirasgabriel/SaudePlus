package br.com.saudeplus.areapaciente;

import org.springframework.stereotype.Component;

import br.com.saudeplus.exception.AcessoProibidoException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.security.UsuarioAutenticado;

/**
 * Resolve o perfil de paciente de quem está logado. Toda rota
 * `/api/paciente/**` parte daqui: o paciente vem do token, nunca da URL.
 */
@Component
class PacienteLogado {

    private final PacienteRepository pacientes;

    PacienteLogado(PacienteRepository pacientes) {
        this.pacientes = pacientes;
    }

    java.util.Optional<Paciente> porUsuario(java.util.UUID usuarioId) {
        return pacientes.findByUsuarioId(usuarioId);
    }

    java.util.List<Paciente> ativosPorNome() {
        return pacientes.ativosPorNome();
    }

    Paciente de(UsuarioAutenticado usuario) {
        return pacientes.findByUsuarioId(usuario.id())
                .orElseThrow(() -> new AcessoProibidoException("Seu cadastro de paciente não foi encontrado."));
    }
}
