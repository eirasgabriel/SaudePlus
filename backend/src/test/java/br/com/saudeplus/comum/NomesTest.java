package br.com.saudeplus.comum;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class NomesTest {

    @Test
    @DisplayName("primeira e última palavra do nome")
    void primeiraEUltima() {
        assertEquals("AF", Nomes.iniciais("Ana Paula Ferreira"));
        assertEquals("JS", Nomes.iniciais("João Gabriel Santos"));
        assertEquals("MC", Nomes.iniciais("Mariana Costa"));
        assertEquals("CL", Nomes.iniciais("Carlos Eduardo Lima"));
    }

    @Test
    @DisplayName("preposições curtas em minúsculas não contam")
    void ignoraPreposicoes() {
        assertEquals("MS", Nomes.iniciais("Maria da Silva"));
        assertEquals("JS", Nomes.iniciais("João de Souza"));
    }

    @Test
    @DisplayName("nome único ou vazio")
    void casosLimite() {
        assertEquals("M", Nomes.iniciais("Madonna"));
        assertEquals("", Nomes.iniciais(""));
        assertEquals("", Nomes.iniciais("   "));
        assertEquals("", Nomes.iniciais(null));
    }
}
