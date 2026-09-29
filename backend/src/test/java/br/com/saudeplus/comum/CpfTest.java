package br.com.saudeplus.comum;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CpfTest {

    @Test
    @DisplayName("aceita com ou sem pontuação e guarda formatado")
    void normaliza() {
        assertEquals("529.982.247-25", Cpf.normalizar("52998224725"));
        assertEquals("529.982.247-25", Cpf.normalizar(" 529.982.247-25 "));
    }

    @Test
    @DisplayName("vazio vira nulo (CPF é opcional)")
    void vazio() {
        assertNull(Cpf.normalizar(null));
        assertNull(Cpf.normalizar("  "));
    }

    @Test
    @DisplayName("recusa dígito verificador errado, tamanho errado e dígitos repetidos")
    void recusa() {
        assertThrows(IllegalArgumentException.class, () -> Cpf.normalizar("529.982.247-24"));
        assertThrows(IllegalArgumentException.class, () -> Cpf.normalizar("1234567890"));
        assertThrows(IllegalArgumentException.class, () -> Cpf.normalizar("111.111.111-11"));
    }
}
