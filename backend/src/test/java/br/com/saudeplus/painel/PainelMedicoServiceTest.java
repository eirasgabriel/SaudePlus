package br.com.saudeplus.painel;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import br.com.saudeplus.agendamentos.AgendaService;
import br.com.saudeplus.agendamentos.ConsultaEmMemoriaRepository;
import br.com.saudeplus.agendamentos.StatusConsulta;
import br.com.saudeplus.clinicas.UnidadeEmMemoriaRepository;
import br.com.saudeplus.dados.DadosDemonstracao;
import br.com.saudeplus.exames.ExameEmMemoriaRepository;
import br.com.saudeplus.exames.ExameService;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.notificacoes.NotificacaoEmMemoriaRepository;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.pacientes.PacienteEmMemoriaRepository;
import br.com.saudeplus.pacientes.PacienteService;
import br.com.saudeplus.painel.dto.PainelMedicoResposta;
import br.com.saudeplus.painel.dto.ResumoDoDiaResposta;
import br.com.saudeplus.profissionais.MedicoEmMemoriaRepository;

class PainelMedicoServiceTest {

    private static final String MEDICO = DadosDemonstracao.MEDICO_ID;

    private PainelMedicoService painel;
    private AgendaService agenda;

    @BeforeEach
    void preparar() {
        PacienteEmMemoriaRepository pacientes = new PacienteEmMemoriaRepository();
        agenda = new AgendaService(new ConsultaEmMemoriaRepository(), pacientes);
        painel = new PainelMedicoService(
                new MedicoEmMemoriaRepository(),
                new UnidadeEmMemoriaRepository(),
                agenda,
                new PacienteService(pacientes),
                new ExameService(new ExameEmMemoriaRepository(), pacientes),
                new NotificacaoService(new NotificacaoEmMemoriaRepository()));
    }

    @Test
    @DisplayName("monta o painel inteiro numa resposta só")
    void montaOPainel() {
        PainelMedicoResposta resposta = painel.montar(MEDICO, null);

        assertEquals("Dr. Carlos Mendes", resposta.medico().nome());
        assertEquals("Clínica da Família – Centro", resposta.unidade().nome());
        assertEquals(DadosDemonstracao.DATA_REFERENCIA, resposta.dataReferencia());
        assertEquals(8, resposta.agenda().size());
        assertEquals(3, resposta.examesPendentes().size());
        assertEquals(3, resposta.notificacoes().size());
        assertNotNull(resposta.fraseDoDia());
    }

    @Test
    @DisplayName("o painel mostra no máximo cinco pacientes")
    void limiteDePacientes() {
        assertEquals(5, painel.montar(MEDICO, null).pacientes().size());
    }

    @Test
    @DisplayName("os contadores saem dos dados, não de valores fixos")
    void contadoresDerivados() {
        PainelMedicoResposta resposta = painel.montar(MEDICO, null);
        ResumoDoDiaResposta resumo = resposta.resumo();

        assertEquals(resposta.agenda().size(), resumo.consultasHoje());
        assertEquals(resposta.examesPendentes().size(), resumo.examesPendentes());
        assertEquals(3, resumo.pacientesAtendidos());
        assertEquals(4, resumo.proximasConsultas());
        assertEquals("10:40", resumo.primeiroHorarioPendente());
        assertTrue(resumo.pacientesAtendidos() <= resumo.consultasHoje());
        assertTrue(resumo.proximasConsultas() <= resumo.consultasHoje());
    }

    @Test
    @DisplayName("mudar um status move os contadores junto")
    void contadoresAcompanhamOStatus() {
        agenda.atualizarStatus("ag-5", StatusConsulta.REALIZADA);

        ResumoDoDiaResposta resumo = painel.montar(MEDICO, null).resumo();

        assertEquals(4, resumo.pacientesAtendidos());
        assertEquals(3, resumo.proximasConsultas());
        assertEquals("11:20", resumo.primeiroHorarioPendente());
    }

    @Test
    @DisplayName("sem consultas pendentes o horário vem nulo")
    void semPendentes() {
        for (String id : new String[] {"ag-5", "ag-6", "ag-7", "ag-8"}) {
            agenda.atualizarStatus(id, StatusConsulta.REALIZADA);
        }

        ResumoDoDiaResposta resumo = painel.montar(MEDICO, null).resumo();

        assertEquals(0, resumo.proximasConsultas());
        assertNull(resumo.primeiroHorarioPendente());
    }

    @Test
    @DisplayName("médico inexistente vira 404 em vez de painel vazio")
    void medicoInexistente() {
        assertThrows(RecursoNaoEncontradoException.class, () -> painel.montar("nao-existe", null));
    }
}
