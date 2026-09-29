package br.com.saudeplus.exception;

import java.util.Map;
import org.springframework.http.HttpStatus;

/** Falha de regra de negocio com status HTTP ja definido. Tratada em {@link GlobalExceptionHandler}. */
public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final String erro;
	private final Map<String, String> campos;

	public ApiException(HttpStatus status, String erro, String mensagem) {
		this(status, erro, mensagem, null);
	}

	public ApiException(HttpStatus status, String erro, String mensagem, Map<String, String> campos) {
		super(mensagem);
		this.status = status;
		this.erro = erro;
		this.campos = campos;
	}

	public static ApiException validacao(String campo, String mensagem) {
		return new ApiException(HttpStatus.BAD_REQUEST, "Dados inválidos",
				"Confira os campos destacados e tente novamente.", Map.of(campo, mensagem));
	}

	public HttpStatus getStatus() {
		return status;
	}

	public String getErro() {
		return erro;
	}

	public Map<String, String> getCampos() {
		return campos;
	}
}
