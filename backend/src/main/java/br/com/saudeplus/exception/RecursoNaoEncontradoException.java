package br.com.saudeplus.exception;

/** Recurso pedido pela URL não existe. O tratador devolve 404. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }

    public static RecursoNaoEncontradoException de(String recurso, String id) {
        return new RecursoNaoEncontradoException("%s não encontrado: %s".formatted(recurso, id));
    }
}
