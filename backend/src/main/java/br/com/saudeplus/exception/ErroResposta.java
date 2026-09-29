package br.com.saudeplus.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

/** Corpo unico de erro da API (ver docs/api.md). {@code campos} so existe em erros de validacao. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResposta(String timestamp, int status, String erro, String mensagem,
		Map<String, String> campos) {

	public static ErroResposta de(int status, String erro, String mensagem) {
		return new ErroResposta(Instant.now().toString(), status, erro, mensagem, null);
	}

	public static ErroResposta de(int status, String erro, String mensagem, Map<String, String> campos) {
		return new ErroResposta(Instant.now().toString(), status, erro, mensagem, campos);
	}
}
