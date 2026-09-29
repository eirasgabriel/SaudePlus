package br.com.saudeplus.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RecuperarSenhaRequest(
		@NotBlank(message = "Informe seu e-mail")
		@Email(message = "Informe um e-mail válido")
		String email) {
}
