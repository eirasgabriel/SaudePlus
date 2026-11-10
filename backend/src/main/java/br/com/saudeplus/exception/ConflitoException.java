package br.com.saudeplus.exception;

/**
 * A operação colide com o estado atual (e-mail já cadastrado, horário que
 * acabou de ser reservado). Devolve 409.
 */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
