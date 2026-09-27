package br.com.saudeplus.exception;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Traduz exceções em respostas JSON com o mesmo formato, para que o front-end
 * nunca receba uma página de erro do servidor de aplicação.
 */
@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> naoEncontrado(RecursoNaoEncontradoException excecao, WebRequest requisicao) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResposta.de(404, "Not Found", excecao.getMessage(), caminho(requisicao)));
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ErroResposta> regraDeNegocio(RegraDeNegocioException excecao, WebRequest requisicao) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ErroResposta.de(422, "Unprocessable Entity", excecao.getMessage(), caminho(requisicao)));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> validacao(MethodArgumentNotValidException excecao, WebRequest requisicao) {
        List<ErroResposta.CampoInvalido> campos = excecao.getBindingResult().getFieldErrors().stream()
                .map(erro -> new ErroResposta.CampoInvalido(erro.getField(), erro.getDefaultMessage()))
                .toList();
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ErroResposta.validacao(caminho(requisicao), campos));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResposta> tipoInvalido(MethodArgumentTypeMismatchException excecao, WebRequest requisicao) {
        String mensagem = "O parâmetro '%s' recebeu um valor inválido: %s".formatted(excecao.getName(), excecao.getValue());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErroResposta.de(400, "Bad Request", mensagem, caminho(requisicao)));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResposta> argumentoInvalido(IllegalArgumentException excecao, WebRequest requisicao) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErroResposta.de(400, "Bad Request", excecao.getMessage(), caminho(requisicao)));
    }

    private String caminho(WebRequest requisicao) {
        return requisicao.getDescription(false).replaceFirst("^uri=", "");
    }
}
