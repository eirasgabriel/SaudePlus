package br.com.saudeplus.pacientes;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PacienteTest {

    private static String iniciaisDe(String nome) {
        return new PacienteAcompanhado("id", nome, 30, "Consulta", "med-1").iniciais();
    }

    @Test
    @DisplayName("usa a primeira e a última parte relevante do nome")
    void iniciaisDeNomeCompleto() {
        assertEquals("AF", iniciaisDe("Ana Paula Ferreira"));
        assertEquals("JS", iniciaisDe("João Gabriel Santos"));
        assertEquals("MC", iniciaisDe("Mariana Costa"));
        assertEquals("CL", iniciaisDe("Carlos Eduardo Lima"));
    }

    @Test
    @DisplayName("ignora partículas em minúsculo")
    void iniciaisIgnoramParticulas() {
        assertEquals("MS", iniciaisDe("Maria da Silva"));
        assertEquals("JS", iniciaisDe("João de Souza"));
    }

    @Test
    @DisplayName("não quebra com nome único nem com nome vazio")
    void iniciaisDeCasosLimite() {
        assertEquals("M", iniciaisDe("Madonna"));
        assertEquals("", iniciaisDe(""));
        assertEquals("", iniciaisDe("   "));
    }
}
