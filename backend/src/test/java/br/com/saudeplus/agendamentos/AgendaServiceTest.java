package br.com.saudeplus.agendamentos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import br.com.saudeplus.agendamentos.dto.ConsultaResposta;
import br.com.saudeplus.dados.DadosDemonstracao;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.pacientes.PacienteEmMemoriaRepository;

/** Regras da agenda, sem subir o contexto do Spring. */
class AgendaServiceTest {

    private static final String MEDICO = DadosDemonstracao.MEDICO_ID;
    private static final LocalDate DIA = DadosDemonstracao.DATA_REFERENCIA;

    private AgendaService servico;

    @BeforeEach
    void preparar() {
        servico = new AgendaService(new ConsultaEmMemoriaRepository(), new PacienteEmMemoriaRepository());
    }

    @Test
    @DisplayName("devolve a agenda do dia ordenada por horário")
    void agendaOrdenada() {
        List<ConsultaResposta> agenda = servico.agendaDoDia(MEDICO, DIA, null);

        assertEquals(8, agenda.size());
        assertEquals("08:00", agenda.get(0).horario());
        assertEquals("14:40", agenda.get(agenda.size() - 1).horario());

        List<String> horarios = agenda.stream().map(ConsultaResposta::horario).toList();
        assertEquals(horarios.stream().sorted().toList(), horarios);
    }

    @Test
    @DisplayName("resolve o nome do paciente de cada consulta")
    void agendaComNomeDoPaciente() {
        ConsultaResposta primeira = servico.agendaDoDia(MEDICO, DIA, null).get(0);

        assertEquals("Ana Paula Ferreira", primeira.paciente());
        assertEquals("ana-paula-ferreira", primeira.pacienteId());
    }

    @Test
    @DisplayName("filtra por status e devolve só aquele status")
    void filtroPorStatus() {
        for (StatusConsulta status : StatusConsulta.values()) {
            List<ConsultaResposta> filtrada = servico.agendaDoDia(MEDICO, DIA, status);
            assertTrue(filtrada.stream().allMatch(consulta -> consulta.status() == status));
        }

        assertEquals(3, servico.agendaDoDia(MEDICO, DIA, StatusConsulta.REALIZADA).size());
        assertEquals(1, servico.agendaDoDia(MEDICO, DIA, StatusConsulta.EM_ANDAMENTO).size());
    }

    @Test
    @DisplayName("a contagem por status soma o total do dia")
    void contagemSomaOTotal() {
        Map<String, Integer> contagem = servico.contagemPorStatus(MEDICO, DIA);

        assertEquals(StatusConsulta.values().length, contagem.size());
        assertEquals(servico.totalDoDia(MEDICO, DIA), contagem.values().stream().mapToInt(Integer::intValue).sum());
    }

    @Test
    @DisplayName("atendidas conta só os status concluídos")
    void atendidasContaConcluidas() {
        assertEquals(3, servico.atendidas(MEDICO, DIA));
        assertTrue(servico.atendidas(MEDICO, DIA) <= servico.totalDoDia(MEDICO, DIA));
    }

    @Test
    @DisplayName("pendentes exclui as concluídas e a que está em andamento")
    void pendentesExcluemEmAndamento() {
        List<Consulta> pendentes = servico.pendentes(MEDICO, DIA);

        assertEquals(4, pendentes.size());
        assertTrue(pendentes.stream().noneMatch(consulta -> consulta.status().concluida()));
        assertTrue(pendentes.stream().noneMatch(consulta -> consulta.status() == StatusConsulta.EM_ANDAMENTO));
        assertEquals("10:40", pendentes.get(0).horario().toString());
    }

    @Test
    @DisplayName("mudar o status altera a consulta e os contadores")
    void atualizarStatus() {
        int atendidasAntes = servico.atendidas(MEDICO, DIA);

        ConsultaResposta atualizada = servico.atualizarStatus("ag-4", StatusConsulta.REALIZADA);

        assertEquals(StatusConsulta.REALIZADA, atualizada.status());
        assertEquals(atendidasAntes + 1, servico.atendidas(MEDICO, DIA));
    }

    @Test
    @DisplayName("consulta inexistente vira 404")
    void consultaInexistente() {
        assertThrows(
                RecursoNaoEncontradoException.class,
                () -> servico.atualizarStatus("nao-existe", StatusConsulta.REALIZADA));
    }

    @Test
    @DisplayName("dia sem consultas devolve lista vazia, não erro")
    void diaSemConsultas() {
        List<ConsultaResposta> agenda = servico.agendaDoDia(MEDICO, DIA.plusYears(1), null);

        assertNotNull(agenda);
        assertTrue(agenda.isEmpty());
    }
}
