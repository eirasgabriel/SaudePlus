package br.com.saudeplus.areamedico;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.Cenarios;
import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exames.TipoExameRepository;
import br.com.saudeplus.notificacoes.NotificacaoRepository;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.TipoNotificacao;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.usuarios.Papel;

/**
 * Área do médico (`/api/medico/**`) de ponta a ponta. Cada teste cria o
 * próprio médico, então os dados de um não aparecem no outro.
 */
@TesteDeIntegracao
class AreaMedicoApiTest {

    @Autowired
    private WebApplicationContext contexto;
    @Autowired
    private AgendamentoRepository agendamentos;
    @Autowired
    private ExameRepository exames;
    @Autowired
    private TipoExameRepository tiposDeExame;
    @Autowired
    private NotificacaoRepository notificacoes;
    @Autowired
    private NotificacaoService notificador;
    @Autowired
    private Clock relogio;

    private MockMvc mvc;
    private Cenarios cenarios;

    /** Uma segunda-feira da semana que vem: dentro da janela de agenda e longe da antecedência mínima. */
    private LocalDate dia;
    private Medico medico;
    private String bearer;
    private Paciente ana;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        dia = LocalDate.now(relogio).plusDays(7).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        medico = cenarios.medico();
        bearer = cenarios.bearer(medico);
        ana = cenarios.paciente("Ana Paula Ferreira", LocalDate.of(1994, 3, 12));
    }

    private ResultActions chamar(MockHttpServletRequestBuilder requisicao) throws Exception {
        return mvc.perform(requisicao.header(HttpHeaders.AUTHORIZATION, bearer));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder requisicao, String corpo) {
        return requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    @Nested
    @DisplayName("Acesso")
    class Acesso {

        @Test
        @DisplayName("sem token 401, paciente 403, médico sem perfil profissional 403")
        void quemEntra() throws Exception {
            mvc.perform(get("/api/medico/painel")).andExpect(status().isUnauthorized());

            String paciente = cenarios.bearer(ana.getUsuario());
            mvc.perform(get("/api/medico/painel").header(HttpHeaders.AUTHORIZATION, paciente))
                    .andExpect(status().isForbidden());

            String semPerfil = cenarios.bearer(cenarios.usuario("Dr. Sem Perfil", Papel.MEDICO));
            mvc.perform(get("/api/medico/painel").header(HttpHeaders.AUTHORIZATION, semPerfil))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.mensagem").value(org.hamcrest.Matchers.containsString("perfil profissional")));
        }

        @Test
        @DisplayName("consulta de outro médico dá 404, não 403")
        void consultaDeOutroMedico() throws Exception {
            Medico outro = cenarios.medico();
            Agendamento alheio = cenarios.agendamento(outro, ana, dia, "08:00", StatusAgendamento.CONFIRMADA);
            chamar(json(patch("/api/medico/agendamentos/{id}/status", alheio.getId()), "{\"status\":\"aguardando\"}"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Painel e agenda")
    class Painel {

        @Test
        @DisplayName("painel do dia no formato que o front consome")
        void painel() throws Exception {
            Paciente joao = cenarios.paciente("João Gabriel Santos", null);
            cenarios.agendamento(medico, ana, dia, "08:00", StatusAgendamento.REALIZADA);
            cenarios.agendamento(medico, joao, dia, "08:30", StatusAgendamento.AGUARDANDO);
            cenarios.agendamento(medico, joao, dia, "09:00", StatusAgendamento.CONFIRMADA);
            cenarios.agendamento(medico, ana, dia, "09:30", StatusAgendamento.CANCELADA);
            // Consulta passada: é o que alimenta "pacientes recentes".
            cenarios.agendamento(medico, ana, LocalDate.now(relogio).minusDays(2), "10:00", StatusAgendamento.REALIZADA);

            chamar(get("/api/medico/painel").param("data", dia.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.medico.nome").value(medico.getUsuario().getNomeCompleto()))
                    .andExpect(jsonPath("$.medico.especialidade").value("Clínico Geral"))
                    .andExpect(jsonPath("$.medico.crm").value("CRM " + medico.getCrm() + "-RJ"))
                    .andExpect(jsonPath("$.unidade.nome").value("Clínica da Família – Centro"))
                    .andExpect(jsonPath("$.unidade.cidade").value("Saquarema"))
                    .andExpect(jsonPath("$.dataReferencia").value(dia.toString()))
                    .andExpect(jsonPath("$.agenda[*].horario", contains("08:00", "08:30", "09:00", "09:30")))
                    .andExpect(jsonPath("$.agenda[1].paciente").value("João Gabriel Santos"))
                    .andExpect(jsonPath("$.agenda[1].tipo").value("Consulta de teste"))
                    .andExpect(jsonPath("$.contagemPorStatus.realizada").value(1))
                    .andExpect(jsonPath("$.contagemPorStatus.cancelada").value(1))
                    .andExpect(jsonPath("$.contagemPorStatus.pendente").value(0))
                    .andExpect(jsonPath("$.resumo.consultasHoje").value(3))
                    .andExpect(jsonPath("$.resumo.pacientesAtendidos").value(1))
                    .andExpect(jsonPath("$.resumo.proximasConsultas").value(2))
                    .andExpect(jsonPath("$.resumo.primeiroHorarioPendente").value("08:30"))
                    .andExpect(jsonPath("$.pacientes[0].nome").value("Ana Paula Ferreira"))
                    .andExpect(jsonPath("$.pacientes[0].iniciais").value("AF"))
                    .andExpect(jsonPath("$.pacientes[0].idade").isNumber());
        }

        @Test
        @DisplayName("agenda filtra por status e aceita 'todas'")
        void agendaFiltrada() throws Exception {
            cenarios.agendamento(medico, ana, dia, "08:00", StatusAgendamento.CONFIRMADA);
            cenarios.agendamento(medico, ana, dia, "09:00", StatusAgendamento.PENDENTE);
            chamar(get("/api/medico/agenda").param("data", dia.toString()).param("status", "confirmada"))
                    .andExpect(jsonPath("$[*].horario", contains("08:00")));
            chamar(get("/api/medico/agenda").param("data", dia.toString()).param("status", "todas"))
                    .andExpect(jsonPath("$", hasSize(2)));
            chamar(get("/api/medico/agenda").param("status", "inventado"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Andamento da consulta")
    class Andamento {

        @Test
        @DisplayName("segue as transições permitidas e recusa atalho com 422")
        void transicoes() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, ana, dia, "08:00", StatusAgendamento.CONFIRMADA);
            chamar(json(patch("/api/medico/agendamentos/{id}/status", consulta.getId()), "{\"status\":\"aguardando\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("aguardando"));
            chamar(json(patch("/api/medico/agendamentos/{id}/status", consulta.getId()), "{\"status\":\"realizada\"}"))
                    .andExpect(status().isUnprocessableContent());
            chamar(json(patch("/api/medico/agendamentos/{id}/status", consulta.getId()), "{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.status").exists());
        }

        @Test
        @DisplayName("registrar atendimento encerra a consulta em andamento")
        void atendimento() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, ana, dia, "08:00", StatusAgendamento.EM_ANDAMENTO);
            chamar(json(patch("/api/medico/agendamentos/{id}/atendimento", consulta.getId()),
                    "{\"resumo\":\"Paciente estável.\",\"desfecho\":\"Retorno em 30 dias.\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("realizada"));

            Agendamento confirmada = cenarios.agendamento(medico, ana, dia, "09:00", StatusAgendamento.CONFIRMADA);
            chamar(json(patch("/api/medico/agendamentos/{id}/atendimento", confirmada.getId()),
                    "{\"resumo\":\"Ainda não começou.\"}"))
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        @DisplayName("cancelar pelo médico avisa o paciente")
        void cancelamentoNotifica() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, ana, dia, "08:00", StatusAgendamento.CONFIRMADA);
            chamar(json(patch("/api/medico/agendamentos/{id}/status", consulta.getId()),
                    "{\"status\":\"cancelada\",\"motivo\":\"Imprevisto do profissional.\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("cancelada"));

            var avisos = notificador.doUsuario(ana.getUsuario().getId());
            assertEquals(1, avisos.size());
            assertEquals(TipoNotificacao.CANCELAMENTO, avisos.getFirst().tipo());
        }
    }

    @Nested
    @DisplayName("Pacientes")
    class Pacientes {

        @Test
        @DisplayName("lista só quem tem consulta com o médico, com busca por nome")
        void lista() throws Exception {
            Paciente bruno = cenarios.paciente("Bruno Tavares", LocalDate.of(1980, 1, 1));
            Paciente semVinculo = cenarios.paciente("Carla Sem Vínculo", LocalDate.of(1990, 1, 1));
            cenarios.agendamento(medico, ana, dia, "08:00", StatusAgendamento.CONFIRMADA);
            cenarios.agendamento(medico, bruno, dia, "09:00", StatusAgendamento.PENDENTE);
            cenarios.agendamento(cenarios.medico(), semVinculo, dia, "08:00", StatusAgendamento.CONFIRMADA);

            chamar(get("/api/medico/pacientes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElementos").value(2))
                    .andExpect(jsonPath("$.conteudo[*].nome", contains("Ana Paula Ferreira", "Bruno Tavares")))
                    .andExpect(jsonPath("$.conteudo[0].ultimaConsulta").value(dia.toString()));
            chamar(get("/api/medico/pacientes").param("q", "brun"))
                    .andExpect(jsonPath("$.conteudo[*].nome", contains("Bruno Tavares")));
            chamar(get("/api/medico/pacientes/{id}", semVinculo.getId()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("ficha traz o histórico com este médico")
        void ficha() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, ana, dia, "08:00", StatusAgendamento.EM_ANDAMENTO);
            chamar(json(patch("/api/medico/agendamentos/{id}/atendimento", consulta.getId()),
                    "{\"resumo\":\"Pressão controlada.\"}"));
            chamar(get("/api/medico/pacientes/{id}", ana.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nome").value("Ana Paula Ferreira"))
                    .andExpect(jsonPath("$.dataNascimento").value("1994-03-12"))
                    .andExpect(jsonPath("$.historico[0].resumo").value("Pressão controlada."))
                    .andExpect(jsonPath("$.historico[0].status").value("realizada"));
        }
    }

    @Nested
    @DisplayName("Configuração da agenda")
    class Configuracao {

        private static final String JANELA = """
                {"unidadeId":"%s","diaSemana":1,"inicio":"08:00","fim":"10:00","duracaoMin":30,"modalidade":"presencial"}""";

        @Test
        @DisplayName("janela nova gera horários públicos, e consulta marcada ocupa o horário")
        void janelaEHorarios() throws Exception {
            chamar(json(post("/api/medico/disponibilidades"), JANELA.formatted(Cenarios.UNIDADE_CENTRO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.inicio").value("08:00"))
                    .andExpect(jsonPath("$.unidade.nome").value("Clínica da Família – Centro"));
            cenarios.agendamento(medico, ana, dia, "08:30", StatusAgendamento.CONFIRMADA);

            mvc.perform(get("/api/publico/profissionais/{id}/horarios", medico.getId())
                            .param("de", dia.toString()).param("ate", dia.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].horario", contains("08:00", "09:00", "09:30")))
                    .andExpect(jsonPath("$[0].modalidade").value("presencial"));
        }

        @Test
        @DisplayName("recusa janela sobreposta (409), em unidade alheia (422) e com fim antes do início (400)")
        void validacoes() throws Exception {
            chamar(json(post("/api/medico/disponibilidades"), JANELA.formatted(Cenarios.UNIDADE_CENTRO)))
                    .andExpect(status().isCreated());
            chamar(json(post("/api/medico/disponibilidades"), JANELA.formatted(Cenarios.UNIDADE_CENTRO)
                    .replace("\"08:00\"", "\"09:30\"").replace("\"10:00\"", "\"11:00\"")))
                    .andExpect(status().isConflict());
            chamar(json(post("/api/medico/disponibilidades"), JANELA.formatted(Cenarios.UNIDADE_PAULISTA)
                    .replace("\"diaSemana\":1", "\"diaSemana\":2")))
                    .andExpect(status().isUnprocessableContent());
            chamar(json(post("/api/medico/disponibilidades"), JANELA.formatted(Cenarios.UNIDADE_CENTRO)
                    .replace("\"diaSemana\":1", "\"diaSemana\":3").replace("\"10:00\"", "\"07:00\"")))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.fim").exists());
        }

        @Test
        @DisplayName("bloqueio sobre consulta marcada exige confirmação e cancela avisando o paciente")
        void bloqueio() throws Exception {
            chamar(json(post("/api/medico/disponibilidades"), JANELA.formatted(Cenarios.UNIDADE_CENTRO)))
                    .andExpect(status().isCreated());
            Agendamento consulta = cenarios.agendamento(medico, ana, dia, "08:30", StatusAgendamento.CONFIRMADA);
            String corpo = "{\"inicio\":\"%sT08:00\",\"fim\":\"%sT09:30\",\"motivo\":\"Congresso\"}".formatted(dia, dia);

            chamar(json(post("/api/medico/bloqueios"), corpo))
                    .andExpect(status().isUnprocessableContent());
            chamar(json(post("/api/medico/bloqueios").param("cancelarAgendamentos", "true"), corpo))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.agendamentosCancelados").value(1))
                    .andExpect(jsonPath("$.inicio").value(dia + "T08:00:00"));

            assertEquals(StatusAgendamento.CANCELADA, agendamentos.findById(consulta.getId()).orElseThrow().getStatus());
            assertEquals(1, notificacoes.countByUsuarioIdAndLidaFalse(ana.getUsuario().getId()));
            mvc.perform(get("/api/publico/profissionais/{id}/horarios", medico.getId())
                            .param("de", dia.toString()).param("ate", dia.toString()))
                    .andExpect(jsonPath("$[*].horario", contains("09:30")));
            chamar(get("/api/medico/bloqueios")).andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("remove janela e bloqueio só do próprio médico")
        void remocao() throws Exception {
            String criada = chamar(json(post("/api/medico/disponibilidades"), JANELA.formatted(Cenarios.UNIDADE_CENTRO)))
                    .andReturn().getResponse().getContentAsString();
            String id = criada.replaceAll(".*?\"id\":\"([^\"]+)\".*", "$1");

            String outro = cenarios.bearer(cenarios.medico());
            mvc.perform(delete("/api/medico/disponibilidades/{id}", id).header(HttpHeaders.AUTHORIZATION, outro))
                    .andExpect(status().isNotFound());
            chamar(delete("/api/medico/disponibilidades/{id}", id)).andExpect(status().isNoContent());
            chamar(get("/api/medico/disponibilidades")).andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("Exames e notificações")
    class ExamesENotificacoes {

        @Test
        @DisplayName("exames pendentes com prazo por extenso")
        void examesPendentes() throws Exception {
            exames.save(new Exame(ana, medico, tiposDeExame.findByNome("Hemograma completo").orElseThrow(),
                    LocalDate.now(relogio)));
            exames.save(new Exame(ana, medico, tiposDeExame.findByNome("Urina tipo 1").orElseThrow(), null));
            chamar(get("/api/medico/exames-pendentes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].nome", contains("Hemograma completo", "Urina tipo 1")))
                    .andExpect(jsonPath("$[0].prazo").value("Hoje"))
                    .andExpect(jsonPath("$[1].prazo").value("Sem prazo"))
                    .andExpect(jsonPath("$[0].paciente").value("Ana Paula Ferreira"));
        }

        @Test
        @DisplayName("marca como lida só notificação própria")
        void notificacoes() throws Exception {
            notificador.notificar(medico.getUsuario(), TipoNotificacao.AGENDAMENTO, "Novo agendamento", "Ana – 08:00");
            String lista = chamar(get("/api/medico/notificacoes"))
                    .andExpect(jsonPath("$[0].quando").value(org.hamcrest.Matchers.startsWith("Hoje, ")))
                    .andReturn().getResponse().getContentAsString();
            UUID id = UUID.fromString(lista.replaceAll(".*?\"id\":\"([^\"]+)\".*", "$1"));

            String outro = cenarios.bearer(cenarios.medico());
            mvc.perform(patch("/api/medico/notificacoes/{id}/lida", id).header(HttpHeaders.AUTHORIZATION, outro))
                    .andExpect(status().isNotFound());
            chamar(patch("/api/medico/notificacoes/{id}/lida", id))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.lida").value(true));
            chamar(get("/api/medico/notificacoes"))
                    .andExpect(jsonPath("$[*].lida", not(hasItem(false))));
        }
    }
}
