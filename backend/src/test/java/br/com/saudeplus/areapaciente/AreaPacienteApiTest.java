package br.com.saudeplus.areapaciente;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exames.TipoExameRepository;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.TipoNotificacao;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;
import tools.jackson.databind.json.JsonMapper;

/**
 * Área do paciente (`/api/paciente/**`) de ponta a ponta. Cada teste cria o
 * próprio médico, com uma janela às segundas (08:00–10:00, 30 min), e o
 * próprio paciente.
 */
@TesteDeIntegracao
class AreaPacienteApiTest {

    private static final String CLINICO_GERAL = "clinico-geral";

    @Autowired
    private WebApplicationContext contexto;
    @Autowired
    private ExameRepository exames;
    @Autowired
    private TipoExameRepository tiposDeExame;
    @Autowired
    private NotificacaoService notificacoes;
    @Autowired
    private JsonMapper json;
    @Autowired
    private Clock relogio;

    private MockMvc mvc;
    private Cenarios cenarios;

    private LocalDate segunda;
    private Medico medico;
    private Paciente ana;
    private String bearer;
    private UUID clinicoGeral;

    @BeforeEach
    void preparar() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        segunda = LocalDate.now(relogio).plusDays(7).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        medico = cenarios.medico();
        cenarios.janela(medico, DayOfWeek.MONDAY, "08:00", "10:00", 30);
        ana = cenarios.paciente("Ana Paula Ferreira", LocalDate.of(1994, 3, 12));
        bearer = cenarios.bearer(ana.getUsuario());
        String especialidades = mvc.perform(get("/api/publico/especialidades")).andReturn().getResponse()
                .getContentAsString();
        for (var item : json.readTree(especialidades)) {
            if (CLINICO_GERAL.equals(item.get("slug").asString())) {
                clinicoGeral = UUID.fromString(item.get("id").asString());
            }
        }
    }

    private ResultActions chamar(MockHttpServletRequestBuilder requisicao) throws Exception {
        return mvc.perform(requisicao.header(HttpHeaders.AUTHORIZATION, bearer));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder requisicao, String corpo) {
        return requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private String corpoDaReserva(Medico com, String horario) {
        return """
                {"medicoId":"%s","especialidadeId":"%s","data":"%s","horario":"%s","motivo":"Check-up"}"""
                .formatted(com.getId(), clinicoGeral, segunda, horario);
    }

    private UUID reservar(String horario) throws Exception {
        String corpo = chamar(json(post("/api/paciente/agendamentos"), corpoDaReserva(medico, horario)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return UUID.fromString(json.readTree(corpo).get("id").asString());
    }

    private ResultActions horariosPublicos() throws Exception {
        return mvc.perform(get("/api/publico/profissionais/{id}/horarios", medico.getId())
                .param("de", segunda.toString()).param("ate", segunda.toString()));
    }

    @Nested
    @DisplayName("Reserva")
    class Reserva {

        @Test
        @DisplayName("reserva horário livre, fica pendente, sai dos horários públicos e avisa o médico")
        void reserva() throws Exception {
            chamar(json(post("/api/paciente/agendamentos"), corpoDaReserva(medico, "08:30")))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("pendente"))
                    .andExpect(jsonPath("$.horario").value("08:30"))
                    .andExpect(jsonPath("$.inicio").value(segunda + "T08:30:00"))
                    .andExpect(jsonPath("$.medico.nome").value(medico.getUsuario().getNomeCompleto()))
                    .andExpect(jsonPath("$.unidade.nome").value("Clínica da Família – Centro"))
                    .andExpect(jsonPath("$.unidade.endereco").value("Rua das Flores, 123 – Centro, Saquarema - RJ"))
                    .andExpect(jsonPath("$.especialidade.nome").value("Clínico Geral"))
                    .andExpect(jsonPath("$.podeAlterar").value(true));

            horariosPublicos().andExpect(jsonPath("$[*].horario", contains("08:00", "09:00", "09:30")));
            var avisos = notificacoes.doUsuario(medico.getUsuario().getId());
            assertEquals("Novo agendamento", avisos.getFirst().titulo());
        }

        @Test
        @DisplayName("horário tomado ou fora da agenda dá 409; especialidade errada 422; médico inexistente 404")
        void recusas() throws Exception {
            reservar("08:00");
            String outro = cenarios.bearer(cenarios.paciente("Bruno Tavares", null).getUsuario());
            mvc.perform(json(post("/api/paciente/agendamentos"), corpoDaReserva(medico, "08:00"))
                            .header(HttpHeaders.AUTHORIZATION, outro))
                    .andExpect(status().isConflict());
            chamar(json(post("/api/paciente/agendamentos"), corpoDaReserva(medico, "07:00")))
                    .andExpect(status().isConflict());

            String cardiologia = corpoDaReserva(medico, "09:00").replace(clinicoGeral.toString(), especialidadeDe("cardiologia"));
            chamar(json(post("/api/paciente/agendamentos"), cardiologia))
                    .andExpect(status().isUnprocessableContent());
            chamar(json(post("/api/paciente/agendamentos"),
                    corpoDaReserva(medico, "09:00").replace(medico.getId().toString(), UUID.randomUUID().toString())))
                    .andExpect(status().isNotFound());
            chamar(json(post("/api/paciente/agendamentos"), "{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.medicoId").exists())
                    .andExpect(jsonPath("$.campos.horario").exists());
        }

        @Test
        @DisplayName("paciente não marca duas consultas no mesmo horário, mesmo com médicos diferentes")
        void choqueNaAgendaDoPaciente() throws Exception {
            Medico outroMedico = cenarios.medico();
            cenarios.janela(outroMedico, DayOfWeek.MONDAY, "08:00", "10:00", 30);
            reservar("08:00");
            chamar(json(post("/api/paciente/agendamentos"), corpoDaReserva(outroMedico, "08:00")))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.mensagem").value("Você já tem uma consulta nesse horário."));
        }

        private String especialidadeDe(String slug) throws Exception {
            String lista = mvc.perform(get("/api/publico/especialidades")).andReturn().getResponse().getContentAsString();
            for (var item : json.readTree(lista)) {
                if (slug.equals(item.get("slug").asString())) {
                    return item.get("id").asString();
                }
            }
            throw new IllegalStateException(slug);
        }
    }

    @Nested
    @DisplayName("Cancelar e remarcar")
    class CancelarERemarcar {

        @Test
        @DisplayName("cancelar libera o horário e avisa o médico; cancelar de novo dá 422")
        void cancelar() throws Exception {
            UUID id = reservar("08:00");
            chamar(json(patch("/api/paciente/agendamentos/{id}/cancelar", id), "{\"motivo\":\"Viagem\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("cancelada"))
                    .andExpect(jsonPath("$.podeAlterar").value(false));

            horariosPublicos().andExpect(jsonPath("$[0].horario").value("08:00"));
            var avisos = notificacoes.doUsuario(medico.getUsuario().getId());
            assertEquals("Consulta cancelada pelo paciente", avisos.getFirst().titulo());
            assertEquals(0, notificacoes.naoLidas(ana.getUsuario().getId()), "quem cancelou não é avisado");

            chamar(patch("/api/paciente/agendamentos/{id}/cancelar", id))
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        @DisplayName("consulta de outra pessoa dá 404")
        void deOutraPessoa() throws Exception {
            UUID id = reservar("08:00");
            String outro = cenarios.bearer(cenarios.paciente("Bruno Tavares", null).getUsuario());
            mvc.perform(patch("/api/paciente/agendamentos/{id}/cancelar", id).header(HttpHeaders.AUTHORIZATION, outro))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("perto demais da consulta, cancelar e remarcar dão 422")
        void antecedencia() throws Exception {
            LocalDateTime daquiATresHoras = LocalDateTime.now(relogio).plusHours(3).withSecond(0).withNano(0);
            Agendamento proxima = cenarios.agendamento(medico, ana, daquiATresHoras.toLocalDate(),
                    daquiATresHoras.format(DateTimeFormatter.ofPattern("HH:mm")), StatusAgendamento.CONFIRMADA);

            chamar(patch("/api/paciente/agendamentos/{id}/cancelar", proxima.getId()))
                    .andExpect(status().isUnprocessableContent())
                    .andExpect(jsonPath("$.mensagem").value(startsWith("Para cancelar, é preciso pelo menos 24 horas")));
            chamar(json(patch("/api/paciente/agendamentos/{id}/remarcar", proxima.getId()),
                    "{\"data\":\"%s\",\"horario\":\"09:00\"}".formatted(segunda)))
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        @DisplayName("remarcar muda o horário, volta a pendente, libera o antigo e avisa o médico")
        void remarcar() throws Exception {
            UUID id = reservar("08:00");
            chamar(json(patch("/api/paciente/agendamentos/{id}/remarcar", id),
                    "{\"data\":\"%s\",\"horario\":\"09:30\"}".formatted(segunda)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.horario").value("09:30"))
                    .andExpect(jsonPath("$.status").value("pendente"));

            horariosPublicos().andExpect(jsonPath("$[*].horario", contains("08:00", "08:30", "09:00")));
            NotificacaoResposta aviso = notificacoes.doUsuario(medico.getUsuario().getId()).getFirst();
            assertEquals("Consulta remarcada", aviso.titulo());
        }
    }

    @Nested
    @DisplayName("Painel, listas e avaliação")
    class Leitura {

        @Test
        @DisplayName("painel traz as próximas consultas, a unidade da próxima e os avisos não lidos")
        void painel() throws Exception {
            reservar("09:00");
            notificacoes.notificar(ana.getUsuario(), TipoNotificacao.SISTEMA, "Bem-vinda", null);
            chamar(get("/api/paciente/painel"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paciente.nome").value("Ana Paula Ferreira"))
                    .andExpect(jsonPath("$.paciente.iniciais").value("AF"))
                    .andExpect(jsonPath("$.proximasConsultas", hasSize(1)))
                    .andExpect(jsonPath("$.unidade.nome").value("Clínica da Família – Centro"))
                    .andExpect(jsonPath("$.notificacoesNaoLidas").value(1));
        }

        @Test
        @DisplayName("lista separa futuras e passadas")
        void listas() throws Exception {
            reservar("09:00");
            cenarios.agendamento(medico, ana, LocalDate.now(relogio).minusDays(3), "10:00", StatusAgendamento.REALIZADA);
            chamar(get("/api/paciente/agendamentos").param("situacao", "futuras"))
                    .andExpect(jsonPath("$[*].horario", contains("09:00")));
            chamar(get("/api/paciente/agendamentos").param("situacao", "passadas"))
                    .andExpect(jsonPath("$[*].status", contains("realizada")));
            chamar(get("/api/paciente/agendamentos")).andExpect(jsonPath("$", hasSize(2)));
        }

        @Test
        @DisplayName("avalia consulta realizada uma vez só e a nota entra no perfil público")
        void avaliacao() throws Exception {
            Agendamento realizada = cenarios.agendamento(medico, ana, LocalDate.now(relogio).minusDays(3), "10:00",
                    StatusAgendamento.REALIZADA);
            chamar(get("/api/paciente/historico"))
                    .andExpect(jsonPath("$[0].id").value(realizada.getId().toString()))
                    .andExpect(jsonPath("$[0].avaliacao").isEmpty());

            String corpo = "{\"agendamentoId\":\"%s\",\"nota\":4,\"comentario\":\"Muito atencioso.\"}"
                    .formatted(realizada.getId());
            chamar(json(post("/api/paciente/avaliacoes"), corpo)).andExpect(status().isCreated());
            chamar(json(post("/api/paciente/avaliacoes"), corpo)).andExpect(status().isConflict());
            chamar(get("/api/paciente/historico")).andExpect(jsonPath("$[0].avaliacao").value(4));

            mvc.perform(get("/api/publico/profissionais/{id}", medico.getId()))
                    .andExpect(jsonPath("$.nota").value(4.0))
                    .andExpect(jsonPath("$.avaliacoes").value(1));
            mvc.perform(get("/api/publico/profissionais/{id}/avaliacoes", medico.getId()))
                    .andExpect(jsonPath("$.conteudo[0].autor").value("Ana F."))
                    .andExpect(jsonPath("$.conteudo[0].comentario").value("Muito atencioso."));

            UUID futura = reservar("08:00");
            chamar(json(post("/api/paciente/avaliacoes"),
                    "{\"agendamentoId\":\"%s\",\"nota\":5}".formatted(futura)))
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        @DisplayName("exames com preparo; exame de outra pessoa dá 404")
        void exames() throws Exception {
            Exame exame = AreaPacienteApiTest.this.exames.save(new Exame(ana, medico,
                    tiposDeExame.findByNome("Glicemia de jejum").orElseThrow(), LocalDate.now(relogio).plusDays(5)));
            chamar(get("/api/paciente/exames"))
                    .andExpect(jsonPath("$[0].nome").value("Glicemia de jejum"))
                    .andExpect(jsonPath("$[0].preparo").value(startsWith("Jejum de 8 a 12 horas")))
                    .andExpect(jsonPath("$[0].status").value("solicitado"))
                    .andExpect(jsonPath("$[0].resultadoDisponivel").value(false));
            chamar(get("/api/paciente/exames").param("status", "liberado")).andExpect(jsonPath("$", hasSize(0)));

            String outro = cenarios.bearer(cenarios.paciente("Bruno Tavares", null).getUsuario());
            mvc.perform(get("/api/paciente/exames/{id}", exame.getId()).header(HttpHeaders.AUTHORIZATION, outro))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("médico não entra na área do paciente")
        void soPaciente() throws Exception {
            mvc.perform(get("/api/paciente/painel").header(HttpHeaders.AUTHORIZATION, cenarios.bearer(medico)))
                    .andExpect(status().isForbidden());
        }
    }
}
