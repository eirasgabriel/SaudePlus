package br.com.saudeplus.exames;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.AbstractMockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.Cenarios;
import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.usuarios.Papel;
import tools.jackson.databind.json.JsonMapper;

/**
 * Ciclo completo de um exame: o médico pede, a clínica agenda, analisa e
 * anexa o resultado, e paciente e médico baixam o arquivo.
 */
@TesteDeIntegracao
class ExamesApiTest {

    private static final byte[] PDF = "%PDF-1.4\n% laudo de teste\n%%EOF".getBytes(StandardCharsets.US_ASCII);

    @Autowired
    private WebApplicationContext contexto;
    @Autowired
    private NotificacaoService notificacoes;
    @Autowired
    private JsonMapper json;
    @Autowired
    private Clock relogio;

    private MockMvc mvc;
    private Cenarios cenarios;
    private Medico medico;
    private Paciente ana;
    private String doMedico;
    private String daPaciente;
    private String daClinica;
    private UUID hemograma;

    @BeforeEach
    void preparar() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        medico = cenarios.medico();
        ana = cenarios.paciente("Ana Paula Ferreira", LocalDate.of(1994, 3, 12));
        cenarios.agendamento(medico, ana, LocalDate.now(relogio).minusDays(2), "10:00", StatusAgendamento.REALIZADA);
        doMedico = cenarios.bearer(medico);
        daPaciente = cenarios.bearer(ana.getUsuario());
        daClinica = cenarios.bearer(cenarios.usuario("Recepção SaudePlus", Papel.ADMIN));

        String tipos = mvc.perform(get("/api/publico/tipos-exame")).andReturn().getResponse().getContentAsString();
        for (var tipo : json.readTree(tipos)) {
            if ("Hemograma completo".equals(tipo.get("nome").asString())) {
                hemograma = UUID.fromString(tipo.get("id").asString());
            }
        }
    }

    private ResultActions como(String bearer, AbstractMockHttpServletRequestBuilder<?> requisicao) throws Exception {
        return mvc.perform(requisicao.header(HttpHeaders.AUTHORIZATION, bearer));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder requisicao, String corpo) {
        return requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private UUID pedirHemograma() throws Exception {
        String corpo = como(doMedico, json(post("/api/medico/exames"),
                "{\"pacienteId\":\"%s\",\"tipoExameId\":\"%s\"}".formatted(ana.getId(), hemograma)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return UUID.fromString(json.readTree(corpo).get("id").asString());
    }

    private MockMultipartHttpServletRequestBuilder envio(UUID exameId, MockMultipartFile arquivo) {
        return multipart("/api/admin/exames/{id}/resultado", exameId).file(arquivo);
    }

    @Test
    @DisplayName("catálogo público de exames traz o preparo")
    void catalogo() throws Exception {
        mvc.perform(get("/api/publico/tipos-exame"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nome == 'Glicemia de jejum')].preparo",
                        hasItem(startsWith("Jejum de 8 a 12 horas"))));
    }

    @Test
    @DisplayName("médico pede exame para paciente seu; paciente é avisado e vê o pedido")
    void solicitar() throws Exception {
        como(doMedico, json(post("/api/medico/exames"),
                "{\"pacienteId\":\"%s\",\"tipoExameId\":\"%s\",\"prazo\":\"%s\"}".formatted(
                        ana.getId(), hemograma, LocalDate.now(relogio).plusDays(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Hemograma completo"))
                .andExpect(jsonPath("$.status").value("solicitado"))
                .andExpect(jsonPath("$.prazo").value("Amanhã"));

        assertEquals("Novo exame solicitado", notificacoes.doUsuario(ana.getUsuario().getId()).getFirst().titulo());
        como(daPaciente, get("/api/paciente/exames"))
                .andExpect(jsonPath("$[0].nome").value("Hemograma completo"))
                .andExpect(jsonPath("$[0].resultadoDisponivel").value(false));
        como(doMedico, get("/api/medico/exames-pendentes"))
                .andExpect(jsonPath("$[0].paciente").value("Ana Paula Ferreira"));
    }

    @Test
    @DisplayName("pedido para quem não é paciente do médico dá 404; exame inexistente 404; prazo passado 400")
    void solicitarRecusado() throws Exception {
        Paciente estranho = cenarios.paciente("Carla Sem Vínculo", null);
        como(doMedico, json(post("/api/medico/exames"),
                "{\"pacienteId\":\"%s\",\"tipoExameId\":\"%s\"}".formatted(estranho.getId(), hemograma)))
                .andExpect(status().isNotFound());
        como(doMedico, json(post("/api/medico/exames"),
                "{\"pacienteId\":\"%s\",\"tipoExameId\":\"%s\"}".formatted(ana.getId(), UUID.randomUUID())))
                .andExpect(status().isNotFound());
        como(doMedico, json(post("/api/medico/exames"),
                "{\"pacienteId\":\"%s\",\"tipoExameId\":\"%s\",\"prazo\":\"2020-01-01\"}".formatted(ana.getId(), hemograma)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.prazo").exists());
    }

    @Test
    @DisplayName("clínica agenda a coleta, analisa e libera o resultado; paciente e médico baixam o arquivo")
    void cicloCompleto() throws Exception {
        UUID exame = pedirHemograma();
        String quando = LocalDate.now(relogio).plusDays(3) + "T07:30";

        como(daClinica, json(patch("/api/admin/exames/{id}/agendamento", exame),
                "{\"dataHora\":\"%s\",\"unidadeId\":\"%s\"}".formatted(quando, Cenarios.UNIDADE_CENTRO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("agendado"))
                .andExpect(jsonPath("$.dataHora").value(quando + ":00"))
                .andExpect(jsonPath("$.unidade").value("Clínica da Família – Centro"));
        assertEquals("Coleta de exame agendada", notificacoes.doUsuario(ana.getUsuario().getId()).getFirst().titulo());

        como(daPaciente, get("/api/paciente/exames/{id}/resultado", exame)).andExpect(status().isNotFound());
        como(daClinica, patch("/api/admin/exames/{id}/em-analise", exame))
                .andExpect(jsonPath("$.status").value("em_analise"));
        como(daClinica, envio(exame, new MockMultipartFile("arquivo", "laudo.pdf", "application/pdf", PDF)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("liberado"))
                .andExpect(jsonPath("$.resultadoLiberadoEm").isNotEmpty());

        assertEquals("Resultado de exame disponível",
                notificacoes.doUsuario(ana.getUsuario().getId()).getFirst().titulo());
        assertEquals("Resultado de exame disponível",
                notificacoes.doUsuario(medico.getUsuario().getId()).getFirst().titulo());

        byte[] baixado = como(daPaciente, get("/api/paciente/exames/{id}/resultado", exame))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"resultado-hemograma-completo.pdf\""))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andReturn().getResponse().getContentAsByteArray();
        assertArrayEquals(PDF, baixado);
        como(doMedico, get("/api/medico/exames/{id}/resultado", exame)).andExpect(status().isOk());
        como(daPaciente, get("/api/paciente/exames")).andExpect(jsonPath("$[0].resultadoDisponivel").value(true));
    }

    @Test
    @DisplayName("resultado de outra pessoa ou de outro médico dá 404")
    void acessoAlheio() throws Exception {
        UUID exame = pedirHemograma();
        como(daClinica, envio(exame, new MockMultipartFile("arquivo", "laudo.pdf", "application/pdf", PDF)))
                .andExpect(status().isOk());

        String outraPaciente = cenarios.bearer(cenarios.paciente("Bruno Tavares", null).getUsuario());
        como(outraPaciente, get("/api/paciente/exames/{id}/resultado", exame)).andExpect(status().isNotFound());
        como(cenarios.bearer(cenarios.medico()), get("/api/medico/exames/{id}/resultado", exame))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("upload recusa arquivo que não é PDF/PNG/JPEG (mesmo com nome .pdf) e envio sem arquivo")
    void uploadInvalido() throws Exception {
        UUID exame = pedirHemograma();
        como(daClinica, envio(exame, new MockMultipartFile("arquivo", "laudo.pdf", "application/pdf",
                "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.arquivo").value("Envie um PDF, PNG ou JPEG."));
        como(daClinica, multipart("/api/admin/exames/{id}/resultado", exame))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.arquivo").exists());
    }

    @Test
    @DisplayName("só a clínica opera exames; cancelado não recebe resultado")
    void operacaoDaClinica() throws Exception {
        UUID exame = pedirHemograma();
        como(doMedico, patch("/api/admin/exames/{id}/em-analise", exame)).andExpect(status().isForbidden());
        como(daClinica, get("/api/admin/exames").param("status", "solicitado"))
                .andExpect(jsonPath("$[*].id", hasItem(exame.toString())));

        como(daClinica, patch("/api/admin/exames/{id}/cancelar", exame))
                .andExpect(jsonPath("$.status").value("cancelado"));
        como(daClinica, envio(exame, new MockMultipartFile("arquivo", "laudo.pdf", "application/pdf", PDF)))
                .andExpect(status().isUnprocessableContent());
    }
}
