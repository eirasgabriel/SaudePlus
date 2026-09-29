package br.com.saudeplus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuracao propria do SaudePlus (prefixo "saudeplus" no application.yml). */
@ConfigurationProperties(prefix = "saudeplus")
public record SaudePlusProperties(
		Jwt jwt,
		Cors cors,
		Front front,
		Recuperacao recuperacao,
		ContasIniciais contasIniciais) {

	public record Jwt(String secret, long expiracaoHoras) {
	}

	/** Origens permitidas, separadas por virgula. */
	public record Cors(String origens) {
	}

	public record Front(String url) {
	}

	public record Recuperacao(long validadeMinutos) {
	}

	public record ContasIniciais(Conta admin, Conta medico) {
	}

	public record Conta(String nome, String email, String senha) {
	}
}
