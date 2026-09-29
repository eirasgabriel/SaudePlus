package br.com.saudeplus.exception;

/** Credenciais recusadas (login, senha atual errada). Devolve 401. */
public class NaoAutorizadoException extends RuntimeException {

    public NaoAutorizadoException(String mensagem) {
        super(mensagem);
    }
}
