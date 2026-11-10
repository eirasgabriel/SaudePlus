package br.com.saudeplus.exception;

import java.time.Duration;

/**
 * Tentativas demais num intervalo curto (login, recuperação de senha).
 * Devolve 429 com `Retry-After`.
 */
public class MuitasTentativasException extends RuntimeException {

    private final Duration aguardar;

    public MuitasTentativasException(String mensagem, Duration aguardar) {
        super(mensagem);
        this.aguardar = aguardar;
    }

    public Duration aguardar() {
        return aguardar;
    }
}
