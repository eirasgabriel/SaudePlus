package br.com.saudeplus.agendamentos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.EnumSet;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StatusAgendamentoTest {

    @Test
    @DisplayName("fluxo normal de uma consulta")
    void fluxoNormal() {
        assertTrue(StatusAgendamento.PENDENTE.podeIrPara(StatusAgendamento.CONFIRMADA));
        assertTrue(StatusAgendamento.CONFIRMADA.podeIrPara(StatusAgendamento.AGUARDANDO));
        assertTrue(StatusAgendamento.AGUARDANDO.podeIrPara(StatusAgendamento.EM_ANDAMENTO));
        assertTrue(StatusAgendamento.EM_ANDAMENTO.podeIrPara(StatusAgendamento.REALIZADA));
    }

    @Test
    @DisplayName("cancelar só antes do check-in; falta só de consulta confirmada")
    void cancelamentoEFalta() {
        assertTrue(StatusAgendamento.PENDENTE.podeIrPara(StatusAgendamento.CANCELADA));
        assertTrue(StatusAgendamento.CONFIRMADA.podeIrPara(StatusAgendamento.CANCELADA));
        assertFalse(StatusAgendamento.AGUARDANDO.podeIrPara(StatusAgendamento.CANCELADA));
        assertTrue(StatusAgendamento.CONFIRMADA.podeIrPara(StatusAgendamento.FALTOU));
        assertFalse(StatusAgendamento.PENDENTE.podeIrPara(StatusAgendamento.FALTOU));
    }

    @Test
    @DisplayName("estados finais não têm saída e não se pula etapa")
    void semAtalhos() {
        for (StatusAgendamento fim : EnumSet.of(StatusAgendamento.REALIZADA, StatusAgendamento.CANCELADA,
                StatusAgendamento.FALTOU)) {
            assertTrue(fim.seguintes().isEmpty(), fim.name());
        }
        assertFalse(StatusAgendamento.CONFIRMADA.podeIrPara(StatusAgendamento.REALIZADA));
        assertFalse(StatusAgendamento.PENDENTE.podeIrPara(StatusAgendamento.EM_ANDAMENTO));
    }

    @Test
    @DisplayName("cancelada e falta liberam o horário; as demais ocupam")
    void ocupacao() {
        assertFalse(StatusAgendamento.CANCELADA.ocupaHorario());
        assertFalse(StatusAgendamento.FALTOU.ocupaHorario());
        assertEquals(EnumSet.complementOf(EnumSet.of(StatusAgendamento.CANCELADA, StatusAgendamento.FALTOU)),
                StatusAgendamento.queOcupamHorario());
    }

    @Test
    @DisplayName("aceita a chave do JSON ou o nome da constante")
    void porChave() {
        assertEquals(StatusAgendamento.EM_ANDAMENTO, StatusAgendamento.porChave("em_andamento"));
        assertEquals(StatusAgendamento.EM_ANDAMENTO, StatusAgendamento.porChave("EM_ANDAMENTO"));
        assertNull(StatusAgendamento.porChave(" "));
        assertThrows(IllegalArgumentException.class, () -> StatusAgendamento.porChave("sumiu"));
    }
}
