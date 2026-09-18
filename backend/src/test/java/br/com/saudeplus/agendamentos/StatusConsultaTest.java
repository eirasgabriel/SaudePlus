package br.com.saudeplus.agendamentos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StatusConsultaTest {

    @Test
    @DisplayName("as chaves do JSON batem com as do front-end")
    void chavesDoContrato() {
        assertEquals("realizada", StatusConsulta.REALIZADA.chave());
        assertEquals("em_andamento", StatusConsulta.EM_ANDAMENTO.chave());
        assertEquals("aguardando", StatusConsulta.AGUARDANDO.chave());
        assertEquals("confirmada", StatusConsulta.CONFIRMADA.chave());
    }

    @Test
    @DisplayName("só a consulta realizada conta como concluída")
    void concluidas() {
        assertTrue(StatusConsulta.REALIZADA.concluida());
        assertFalse(StatusConsulta.EM_ANDAMENTO.concluida());
        assertFalse(StatusConsulta.AGUARDANDO.concluida());
        assertFalse(StatusConsulta.CONFIRMADA.concluida());
    }

    @Test
    @DisplayName("pendente exclui a concluída e a que já começou")
    void pendentes() {
        assertFalse(StatusConsulta.REALIZADA.pendente());
        assertFalse(StatusConsulta.EM_ANDAMENTO.pendente());
        assertTrue(StatusConsulta.AGUARDANDO.pendente());
        assertTrue(StatusConsulta.CONFIRMADA.pendente());
    }

    @Test
    @DisplayName("aceita a chave e o nome da constante, e recusa o resto")
    void conversaoPorChave() {
        assertEquals(StatusConsulta.EM_ANDAMENTO, StatusConsulta.porChave("em_andamento"));
        assertEquals(StatusConsulta.EM_ANDAMENTO, StatusConsulta.porChave("EM_ANDAMENTO"));
        assertEquals(StatusConsulta.REALIZADA, StatusConsulta.porChave("Realizada"));
        assertNull(StatusConsulta.porChave(null));
        assertNull(StatusConsulta.porChave("  "));
        assertThrows(IllegalArgumentException.class, () -> StatusConsulta.porChave("cancelada"));
    }
}
