package br.com.saudeplus.pacientes.dto;

import br.com.saudeplus.pacientes.Paciente;

/** `iniciais` vai pronto para o avatar não depender de quem renderiza. */
public record PacienteResposta(
        String id,
        String nome,
        int idade,
        String motivo,
        String iniciais) {

    public static PacienteResposta de(Paciente paciente) {
        return new PacienteResposta(
                paciente.id(),
                paciente.nome(),
                paciente.idade(),
                paciente.motivo(),
                paciente.iniciais());
    }
}
