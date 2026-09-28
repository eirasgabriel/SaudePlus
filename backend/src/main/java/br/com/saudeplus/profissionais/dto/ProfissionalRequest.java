package br.com.saudeplus.profissionais.dto;

import jakarta.validation.constraints.NotBlank;

public record ProfissionalRequest(
        @NotBlank(message = "Nome é obrigatório.")
        String nome,

        @NotBlank(message = "Especialidade é obrigatória.")
        String especialidade,

        @NotBlank(message = "Clínica é obrigatória.")
        String clinica,

        String disponibilidade
) {
}
