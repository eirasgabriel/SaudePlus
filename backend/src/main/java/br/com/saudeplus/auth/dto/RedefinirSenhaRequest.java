package br.com.saudeplus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(
		@NotBlank(message = "O link de recuperação é inválido")
		String token,

		@NotBlank(message = "Informe a nova senha")
		@Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres")
		String senha) {
}
