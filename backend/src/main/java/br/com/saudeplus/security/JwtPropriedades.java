package br.com.saudeplus.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * `saudeplus.jwt.*`. Falha na inicialização se o segredo for curto demais,
 * em vez de subir com uma assinatura fraca ou quebrar só no primeiro login.
 */
@ConfigurationProperties("saudeplus.jwt")
public record JwtPropriedades(String segredo, Duration validade) {

    /** HS256 pede uma chave de pelo menos 256 bits. */
    private static final int BYTES_MINIMOS = 32;

    public JwtPropriedades {
        if (segredo == null || segredo.getBytes(StandardCharsets.UTF_8).length < BYTES_MINIMOS) {
            throw new IllegalStateException(
                    "Defina saudeplus.jwt.segredo (variável JWT_SEGREDO) com pelo menos %d bytes."
                            .formatted(BYTES_MINIMOS));
        }
        if (validade == null) {
            validade = Duration.ofHours(8);
        }
    }

    public byte[] segredoEmBytes() {
        return segredo.getBytes(StandardCharsets.UTF_8);
    }
}
