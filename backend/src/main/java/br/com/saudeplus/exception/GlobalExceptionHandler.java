package br.com.saudeplus.exception;

import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Converte qualquer falha no formato unico {@link ErroResposta}. */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ErroResposta> aoFalharNegocio(ApiException e) {
		return ResponseEntity.status(e.getStatus())
				.body(ErroResposta.de(e.getStatus().value(), e.getErro(), e.getMessage(), e.getCampos()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErroResposta> aoFalharValidacao(MethodArgumentNotValidException e) {
		Map<String, String> campos = new LinkedHashMap<>();
		e.getBindingResult().getFieldErrors()
				.forEach(erro -> campos.putIfAbsent(erro.getField(), erro.getDefaultMessage()));
		return ResponseEntity.badRequest().body(ErroResposta.de(400, "Dados inválidos",
				"Confira os campos destacados e tente novamente.", campos));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErroResposta> aoReceberCorpoIlegivel(HttpMessageNotReadableException e) {
		return ResponseEntity.badRequest().body(ErroResposta.de(400, "Requisição inválida",
				"Não foi possível ler o corpo da requisição. Confira o JSON enviado."));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErroResposta> aoNegarAcesso(AccessDeniedException e) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ErroResposta.de(403, "Acesso negado",
				"Você não tem permissão para acessar este recurso."));
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ErroResposta> aoFalharAutenticacao(AuthenticationException e) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ErroResposta.de(401, "Não autenticado",
				"Faça login para continuar."));
	}

	/** Rede de seguranca: erros do proprio Spring MVC (404, 405, 415...) mantem seu status. */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErroResposta> aoFalharInesperado(Exception e) {
		if (e instanceof ErrorResponse resposta) {
			HttpStatusCode status = resposta.getStatusCode();
			HttpStatus http = HttpStatus.resolve(status.value());
			String erro = http != null ? http.getReasonPhrase() : "Erro";
			return ResponseEntity.status(status)
					.body(ErroResposta.de(status.value(), erro, "Não foi possível concluir a operação."));
		}
		log.error("Erro inesperado", e);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ErroResposta.de(500,
				"Erro interno", "Algo deu errado por aqui. Tente novamente em instantes."));
	}
}
