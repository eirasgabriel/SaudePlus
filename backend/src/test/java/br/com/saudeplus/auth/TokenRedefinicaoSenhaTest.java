package br.com.saudeplus.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class TokenRedefinicaoSenhaTest {

    private static final Instant AGORA = Instant.parse("2026-09-28T12:00:00Z");

    @Test
    @DisplayName("token tem 32 bytes em Base64 URL-safe, sem padding, e muda a cada geração")
    void formatoDoToken() {
        String token = TokenRedefinicaoSenha.gerarTokenEmClaro();
        assertEquals(43, token.length());
        assertTrue(token.matches("[A-Za-z0-9_-]+"));
        assertNotEquals(token, TokenRedefinicaoSenha.gerarTokenEmClaro());
    }

    @Test
    @DisplayName("o banco guarda o SHA-256 em hexa, nunca o token")
    void guardaSoOHash() {
        TokenRedefinicaoSenha token = new TokenRedefinicaoSenha(null, "abc", AGORA, AGORA.plusSeconds(60));
        assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", TokenRedefinicaoSenha.hash("abc"));
        assertTrue(token.utilizavelEm(AGORA));
    }

    @Test
    @DisplayName("deixa de valer ao expirar ou depois de usado")
    void validade() {
        TokenRedefinicaoSenha token = new TokenRedefinicaoSenha(null, "abc", AGORA, AGORA.plusSeconds(60));
        assertFalse(token.utilizavelEm(AGORA.plusSeconds(60)), "expira no instante limite");

        token.consumir(AGORA.plusSeconds(1));
        assertFalse(token.utilizavelEm(AGORA.plusSeconds(2)), "uso único");
    }
}
