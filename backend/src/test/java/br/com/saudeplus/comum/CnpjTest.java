package br.com.saudeplus.comum;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CnpjTest {

    @Test
    @DisplayName("aceita com ou sem pontuação e guarda formatado")
    void normaliza() {
        assertEquals("11.222.333/0001-81", Cnpj.normalizar("11222333000181"));
        assertEquals("11.222.333/0001-81", Cnpj.normalizar(" 11.222.333/0001-81 "));
    }

    @Test
    @DisplayName("vazio vira nulo (CNPJ é opcional)")
    void vazio() {
        assertNull(Cnpj.normalizar(null));
        assertNull(Cnpj.normalizar(" "));
    }

    @Test
    @DisplayName("recusa dígito verificador errado, tamanho errado e dígitos repetidos")
    void recusa() {
        assertThrows(IllegalArgumentException.class, () -> Cnpj.normalizar("11.222.333/0001-80"));
        assertThrows(IllegalArgumentException.class, () -> Cnpj.normalizar("1122233300018"));
        assertThrows(IllegalArgumentException.class, () -> Cnpj.normalizar("11111111111111"));
    }
}
