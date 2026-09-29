package br.com.saudeplus.areamedico;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.LocalDate;

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
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exames.TipoExameRepository;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.TipoNotificacao;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;

/**
 * Telas do médico além do painel: consultas por período, detalhe da consulta,
 * exames, unidades, perfil e notificações. Cada teste cria o próprio médico.
 */
@TesteDeIntegracao
class TelasDoMedicoApiTest {

    @Autowired
    private WebApplicationContext contexto;
    @Autowired
    private ExameRepository exames;
    @Autowired
    private TipoExameRepository tiposDeExame;
    @Autowired
    private NotificacaoService notificador;
    @Autowired
    private Clock relogio;

    private MockMvc mvc;
    private Cenarios cenarios;
    private LocalDate hoje;
    private Medico medico;
    private String bearer;
    private Paciente paciente;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        hoje = LocalDate.now(relogio);
        medico = cenarios.medico();
        bearer = cenarios.bearer(medico);
        paciente = cenarios.paciente("Heloísa Teixeira Campos", LocalDate.of(1980, 5, 20));
    }

    private ResultActions chamar(MockHttpServletRequestBuilder requisicao) throws Exception {
        return mvc.perform(requisicao.header(HttpHeaders.AUTHORIZATION, bearer));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder requisicao, String corpo) {
        return requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private Exame exame(Medico solicitante, Paciente de) {
        return exames.save(new Exame(de, solicitante, tiposDeExame.findByNome("Hemograma completo").orElseThrow(),
                hoje.plusDays(5)));
    }

    @Nested
    @DisplayName("Consultas")
    class Consultas {

        @Test
        @DisplayName("lista o período em ordem, filtra por status e nome; recentes invertem a ordem")
        void periodo() throws Exception {
            Agendamento ontem = cenarios.agendamento(medico, paciente, hoje.minusDays(1), "09:00", StatusAgendamento.REALIZADA);
            Agendamento amanha = cenarios.agendamento(medico, paciente, hoje.plusDays(1), "10:00", StatusAgendamento.PENDENTE);
            Paciente outro = cenarios.paciente("Otávio Mendes Prado", null);
            cenarios.agendamento(medico, outro, hoje.plusDays(2), "11:00", StatusAgendamento.CONFIRMADA);

            chamar(get("/api/medico/consultas"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElementos").value(3))
                    .andExpect(jsonPath("$.conteudo[0].id").value(ontem.getId().toString()))
                    .andExpect(jsonPath("$.conteudo[0].data").value(hoje.minusDays(1).toString()))
                    .andExpect(jsonPath("$.conteudo[0].unidade").value("Clínica da Família – Centro"))
                    .andExpect(jsonPath("$.conteudo[0].especialidade").value("Clínico Geral"));
            chamar(get("/api/medico/consultas").param("status", "pendente"))
                    .andExpect(jsonPath("$.conteudo[*].id", contains(amanha.getId().toString())));
            chamar(get("/api/medico/consultas").param("q", "heloísa"))
                    .andExpect(jsonPath("$.totalElementos").value(2));
            chamar(get("/api/medico/consultas").param("ordem", "recentes").param("tamanho", "1"))
                    .andExpect(jsonPath("$.conteudo[0].paciente").value("Otávio Mendes Prado"))
                    .andExpect(jsonPath("$.totalPaginas").value(3));
        }

        @Test
        @DisplayName("período invertido ou longo demais 400; status desconhecido 400")
        void validacao() throws Exception {
            chamar(get("/api/medico/consultas").param("de", hoje.toString()).param("ate", hoje.minusDays(1).toString()))
                    .andExpect(status().isBadRequest());
            chamar(get("/api/medico/consultas").param("de", hoje.toString()).param("ate", hoje.plusDays(400).toString()))
                    .andExpect(status().isBadRequest());
            chamar(get("/api/medico/consultas").param("status", "inventado")).andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("detalhe traz atendimento e exames pedidos; consulta de outro médico é 404 e não aparece na lista")
        void detalheEIsolamento() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, paciente, hoje, "08:00", StatusAgendamento.EM_ANDAMENTO);
            chamar(json(patch("/api/medico/agendamentos/{id}/atendimento", consulta.getId()),
                    "{\"resumo\":\"Paciente estável.\",\"desfecho\":\"Retorno em 30 dias.\"}"))
                    .andExpect(status().isOk());
            String tipo = tiposDeExame.findByNome("Hemograma completo").orElseThrow().getId().toString();
            chamar(json(post("/api/medico/exames"),
                    "{\"pacienteId\":\"%s\",\"tipoExameId\":\"%s\",\"agendamentoOrigemId\":\"%s\"}"
                            .formatted(paciente.getId(), tipo, consulta.getId())))
                    .andExpect(status().isCreated());

            chamar(get("/api/medico/agendamentos/{id}", consulta.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("realizada"))
                    .andExpect(jsonPath("$.resumo").value("Paciente estável."))
                    .andExpect(jsonPath("$.paciente.idade").isNumber())
                    .andExpect(jsonPath("$.unidade.nome").value("Clínica da Família – Centro"))
                    .andExpect(jsonPath("$.exames", hasSize(1)))
                    .andExpect(jsonPath("$.exames[0].nome").value("Hemograma completo"));

            Medico outroMedico = cenarios.medico();
            String outro = cenarios.bearer(outroMedico);
            mvc.perform(get("/api/medico/agendamentos/{id}", consulta.getId()).header(HttpHeaders.AUTHORIZATION, outro))
                    .andExpect(status().isNotFound());
            mvc.perform(get("/api/medico/consultas").header(HttpHeaders.AUTHORIZATION, outro))
                    .andExpect(jsonPath("$.conteudo[*].id", not(hasItem(consulta.getId().toString()))));
        }

        @Test
        @DisplayName("sem token 401; paciente 403")
        void acesso() throws Exception {
            mvc.perform(get("/api/medico/consultas")).andExpect(status().isUnauthorized());
            mvc.perform(get("/api/medico/consultas").header(HttpHeaders.AUTHORIZATION, cenarios.bearer(paciente.getUsuario())))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Exames")
    class Exames {

        @Test
        @DisplayName("lista todos ou por status, com detalhe; exame de outro médico é 404")
        void listaEDetalhe() throws Exception {
            Exame meu = exame(medico, paciente);
            Exame cancelado = exame(medico, paciente);
            cancelado.cancelar();
            exames.save(cancelado);
            Exame alheio = exame(cenarios.medico(), paciente);

            chamar(get("/api/medico/exames"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElementos").value(2))
                    .andExpect(jsonPath("$.conteudo[*].id", not(hasItem(alheio.getId().toString()))));
            chamar(get("/api/medico/exames").param("status", "pendentes"))
                    .andExpect(jsonPath("$.conteudo[*].id", contains(meu.getId().toString())));
            chamar(get("/api/medico/exames").param("status", "cancelado"))
                    .andExpect(jsonPath("$.conteudo[*].id", contains(cancelado.getId().toString())));
            chamar(get("/api/medico/exames").param("status", "inventado")).andExpect(status().isBadRequest());

            chamar(get("/api/medico/exames/{id}", meu.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nome").value("Hemograma completo"))
                    .andExpect(jsonPath("$.categoria").value("Exame de sangue"))
                    .andExpect(jsonPath("$.paciente").value("Heloísa Teixeira Campos"))
                    .andExpect(jsonPath("$.resultadoDisponivel").value(false));
            chamar(get("/api/medico/exames/{id}", alheio.getId())).andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Perfil, unidades e notificações")
    class PerfilEUnidades {

        @Test
        @DisplayName("perfil mostra CRM e especialidades; bio e valor mudam; valor negativo 400")
        void perfil() throws Exception {
            chamar(get("/api/medico/perfil"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.crm").value(medico.getCrm()))
                    .andExpect(jsonPath("$.especialidades[0].nome").value("Clínico Geral"))
                    .andExpect(jsonPath("$.unidades[0].nome").value("Clínica da Família – Centro"));
            chamar(json(put("/api/medico/perfil"), "{\"bio\":\"Atendo adultos e idosos.\",\"valorConsulta\":180.5}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.bio").value("Atendo adultos e idosos."))
                    .andExpect(jsonPath("$.valorConsulta").value(180.5))
                    .andExpect(jsonPath("$.crm").value(medico.getCrm()));
            chamar(json(put("/api/medico/perfil"), "{\"valorConsulta\":-1}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.valorConsulta").exists());
            // O perfil público reflete a mudança.
            mvc.perform(get("/api/publico/profissionais/{id}", medico.getId()))
                    .andExpect(jsonPath("$.bio").value("Atendo adultos e idosos."));
        }

        @Test
        @DisplayName("unidades vinculadas vêm com o status")
        void unidades() throws Exception {
            chamar(get("/api/medico/unidades"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].cidade").value("Saquarema"))
                    .andExpect(jsonPath("$[0].status").value("ativa"));
        }

        @Test
        @DisplayName("marcar todas como lidas só mexe nas do próprio médico")
        void notificacoes() throws Exception {
            Medico outro = cenarios.medico();
            notificador.notificar(medico.getUsuario(), TipoNotificacao.AGENDAMENTO, "Novo agendamento", null);
            notificador.notificar(outro.getUsuario(), TipoNotificacao.AGENDAMENTO, "Novo agendamento", null);

            chamar(patch("/api/medico/notificacoes/lidas")).andExpect(status().isNoContent());
            chamar(get("/api/medico/notificacoes")).andExpect(jsonPath("$[*].lida", contains(true)));
            mvc.perform(get("/api/medico/notificacoes").header(HttpHeaders.AUTHORIZATION, cenarios.bearer(outro)))
                    .andExpect(jsonPath("$[*].lida", contains(false)));
        }
    }
}
