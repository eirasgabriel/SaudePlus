package br.com.saudeplus.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.tomcat.util.http.InvalidParameterException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
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

    @ExceptionHandler(NaoAutorizadoException.class)
    public ResponseEntity<ErroResposta> naoAutorizado(NaoAutorizadoException excecao, WebRequest requisicao) {
        return responder(HttpStatus.UNAUTHORIZED, excecao.getMessage(), requisicao);
    }

    @ExceptionHandler(AcessoProibidoException.class)
    public ResponseEntity<ErroResposta> acessoProibido(AcessoProibidoException excecao, WebRequest requisicao) {
        return responder(HttpStatus.FORBIDDEN, excecao.getMessage(), requisicao);
    }

    @ExceptionHandler(RequisicaoInvalidaException.class)
    public ResponseEntity<ErroResposta> requisicaoInvalida(RequisicaoInvalidaException excecao, WebRequest requisicao) {
        Map<String, String> campos = excecao.getCampo() == null
                ? Map.of()
                : Map.of(excecao.getCampo(), excecao.getMessage());
        return ResponseEntity.badRequest().body(new ErroResposta(
                Instant.now(), 400, excecao.getTitulo(), excecao.getMessage(), caminho(requisicao), campos));
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResposta> conflito(ConflitoException excecao, WebRequest requisicao) {
        return responder(HttpStatus.CONFLICT, excecao.getMessage(), requisicao);
    }

    @ExceptionHandler(MuitasTentativasException.class)
    public ResponseEntity<ErroResposta> muitasTentativas(MuitasTentativasException excecao, WebRequest requisicao) {
        HttpStatus status = HttpStatus.TOO_MANY_REQUESTS;
        return ResponseEntity.status(status)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(Math.max(1, excecao.aguardar().toSeconds())))
                .body(ErroResposta.de(status.value(), status.getReasonPhrase(), excecao.getMessage(), caminho(requisicao)));
    }

    /** Duas alterações simultâneas do mesmo registro: a segunda perde e é avisada. */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ErroResposta> alteracaoSimultanea(OptimisticLockingFailureException excecao,
            WebRequest requisicao) {
        return responder(HttpStatus.CONFLICT,
                "Estas informações foram alteradas por outra pessoa agora mesmo. Recarregue e tente de novo.", requisicao);
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

    /** Parâmetro de URL que não é UTF-8 válido (o Tomcat recusa a decodificação). */
    @ExceptionHandler(InvalidParameterException.class)
    public ResponseEntity<ErroResposta> parametroMalCodificado(InvalidParameterException excecao, WebRequest requisicao) {
        return responder(HttpStatus.BAD_REQUEST, "Um parâmetro da URL não está codificado em UTF-8.", requisicao);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErroResposta> arquivoGrandeDemais(MaxUploadSizeExceededException excecao, WebRequest requisicao) {
        return responder(HttpStatus.CONTENT_TOO_LARGE, "O arquivo deve ter até 10 MB.", requisicao);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResposta> argumentoInvalido(IllegalArgumentException excecao, WebRequest requisicao) {
        return responder(HttpStatus.BAD_REQUEST, excecao.getMessage(), requisicao);
    }

    /**
     * Erros do próprio Spring MVC: método não aceito (405), tipo de conteúdo
     * (415/406), parâmetro ou parte obrigatória ausente (400). Cada exceção já
     * sabe o seu status; aqui só trocamos o texto técnico por um legível.
     * Sem isto, todas cairiam no genérico abaixo e virariam 500.
     */
    @ExceptionHandler({ HttpRequestMethodNotSupportedException.class, HttpMediaTypeNotSupportedException.class,
            HttpMediaTypeNotAcceptableException.class, ServletRequestBindingException.class,
            MissingServletRequestPartException.class, HandlerMethodValidationException.class,
            ErrorResponseException.class })
    public ResponseEntity<ErroResposta> erroDoSpring(Exception excecao, WebRequest requisicao) {
        HttpStatusCode codigo = ((ErrorResponse) excecao).getStatusCode();
        HttpStatus status = HttpStatus.resolve(codigo.value());
        if (status == null || status.is5xxServerError()) {
            log.error("Erro em {}", caminho(requisicao), excecao);
            return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Algo deu errado do nosso lado. Tente novamente.",
                    requisicao);
        }
        String mensagem = switch (excecao) {
            case HttpRequestMethodNotSupportedException e -> "Esta rota não aceita o método " + e.getMethod() + ".";
            case HttpMediaTypeNotSupportedException e -> "Envie o corpo da requisição como JSON.";
            case HttpMediaTypeNotAcceptableException e -> "Esta rota não responde no formato pedido.";
            case MissingServletRequestParameterException e -> "Informe o parâmetro '" + e.getParameterName() + "'.";
            case MissingServletRequestPartException e -> "Envie o arquivo no campo '" + e.getRequestPartName() + "'.";
            case HandlerMethodValidationException e -> "Confira os parâmetros da requisição.";
            default -> "A requisição não pôde ser atendida.";
        };
        return responder(status, mensagem, requisicao);
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
