package br.com.saudeplus.clinicas.dto;

import jakarta.validation.constraints.NotBlank;

public record ClinicaRequest(
        @NotBlank(message = "Nome é obrigatório.")
        String nome,

        @NotBlank(message = "Especialidade é obrigatória.")
        String especialidade,

        @NotBlank(message = "Endereço é obrigatório.")
        String endereco,

        @NotBlank(message = "Cidade é obrigatória.")
        String cidade,

        @NotBlank(message = "Telefone é obrigatório.")
        String telefone,

        String status,

        String cnpj,

        String unidade,

        String email,

        String horarioFuncionamento
) {
}
