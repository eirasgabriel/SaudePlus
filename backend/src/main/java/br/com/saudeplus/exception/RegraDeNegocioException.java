package br.com.saudeplus.exception;

/** Requisição bem formada, mas que viola uma regra do domínio. Devolve 422. */
public class RegraDeNegocioException extends RuntimeException {

    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}
