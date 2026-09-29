package br.com.saudeplus.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
		@NotBlank(message = "Informe seu e-mail") String email,
		@NotBlank(message = "Informe sua senha") String senha) {
}
