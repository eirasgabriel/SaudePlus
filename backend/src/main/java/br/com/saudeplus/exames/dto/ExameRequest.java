package br.com.saudeplus.exames.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ExameRequest(
        @NotBlank(message = "Nome é obrigatório.")
        String nome,

        @NotBlank(message = "Categoria é obrigatória.")
        String categoria,

        @NotNull(message = "Duração é obrigatória.")
        @Positive(message = "Duração deve ser maior que zero.")
        Integer duracaoMinutos,

        Boolean disponivel
) {
}
