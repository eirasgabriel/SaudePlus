package br.com.saudeplus.agendamentos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AgendamentoRequest(
        @NotBlank(message = "Paciente é obrigatório.")
        String paciente,

        @NotNull(message = "Profissional é obrigatório.")
        Long profissionalId,

        @NotBlank(message = "Data do agendamento é obrigatória.")
        String data,

        @NotBlank(message = "Hora do agendamento é obrigatória.")
        String hora,

        @NotBlank(message = "Tipo do atendimento é obrigatório.")
        String tipo,

        String status
) {
}
