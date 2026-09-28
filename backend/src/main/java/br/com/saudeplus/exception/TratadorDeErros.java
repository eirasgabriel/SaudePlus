package br.com.saudeplus.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Traduz exceções em respostas JSON com o mesmo formato, para que o front-end
 * nunca receba uma página de erro do servidor de aplicação.
 */
@RestControllerAdvice
public class TratadorDeErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorDeErros.class);

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> naoEncontrado(RecursoNaoEncontradoException excecao, WebRequest requisicao) {
        return responder(HttpStatus.NOT_FOUND, excecao.getMessage(), requisicao);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResposta> rotaInexistente(NoResourceFoundException excecao, WebRequest requisicao) {
        return responder(HttpStatus.NOT_FOUND, "Rota não encontrada.", requisicao);
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResposta> conflito(ConflitoException excecao, WebRequest requisicao) {
        return responder(HttpStatus.CONFLICT, excecao.getMessage(), requisicao);
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ErroResposta> regraDeNegocio(RegraDeNegocioException excecao, WebRequest requisicao) {
        return responder(HttpStatus.UNPROCESSABLE_CONTENT, excecao.getMessage(), requisicao);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException excecao, WebRequest requisicao) {
        // Um campo com várias violações mostra só a primeira: o formulário
        // destaca um input por vez.
        Map<String, String> campos = new LinkedHashMap<>();
        excecao.getBindingResult().getFieldErrors()
                .forEach(erro -> campos.putIfAbsent(erro.getField(), erro.getDefaultMessage()));
        return ResponseEntity.badRequest().body(ErroResposta.validacao(caminho(requisicao), campos));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResposta> corpoIlegivel(HttpMessageNotReadableException excecao, WebRequest requisicao) {
        return responder(HttpStatus.BAD_REQUEST, "O corpo da requisição está malformado ou tem um valor inválido.", requisicao);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResposta> tipoInvalido(MethodArgumentTypeMismatchException excecao, WebRequest requisicao) {
        String mensagem = "O parâmetro '%s' recebeu um valor inválido: %s".formatted(excecao.getName(), excecao.getValue());
        return responder(HttpStatus.BAD_REQUEST, mensagem, requisicao);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResposta> argumentoInvalido(IllegalArgumentException excecao, WebRequest requisicao) {
        return responder(HttpStatus.BAD_REQUEST, excecao.getMessage(), requisicao);
    }

    /** Último recurso: registra o erro completo no log e não vaza detalhes ao cliente. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> inesperado(Exception excecao, WebRequest requisicao) {
        log.error("Erro inesperado em {}", caminho(requisicao), excecao);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Algo deu errado do nosso lado. Tente novamente.", requisicao);
    }

    private ResponseEntity<ErroResposta> responder(HttpStatus status, String mensagem, WebRequest requisicao) {
        return ResponseEntity.status(status)
                .body(ErroResposta.de(status.value(), status.getReasonPhrase(), mensagem, caminho(requisicao)));
    }

    private String caminho(WebRequest requisicao) {
        return requisicao.getDescription(false).replaceFirst("^uri=", "");
    }
}
