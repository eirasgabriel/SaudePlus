package br.com.saudeplus.exception;

/** Identidade conhecida, mas sem permissão (conta desativada, por exemplo). Devolve 403. */
public class AcessoProibidoException extends RuntimeException {

    public AcessoProibidoException(String mensagem) {
        super(mensagem);
    }
}
