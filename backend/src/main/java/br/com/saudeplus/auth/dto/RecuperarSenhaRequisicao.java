package br.com.saudeplus.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RecuperarSenhaRequisicao(
        @NotBlank(message = "Informe o e-mail") @Email(message = "Informe um e-mail válido") String email) {
}
