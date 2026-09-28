package br.com.saudeplus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Sem confirmação de senha: conferir se os dois campos batem fica na tela. */
public record RedefinirSenhaRequisicao(
        @NotBlank(message = "Link inválido") String token,

        @NotBlank(message = "Informe a nova senha")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres")
        String senha) {
}
