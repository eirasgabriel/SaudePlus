package br.com.saudeplus.financeiro;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
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
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.usuarios.Papel;
import tools.jackson.databind.json.JsonMapper;

/**
 * Financeiro (cobrança automática, baixa, estorno, resumo) e relatórios
 * (resumo e exportações) de ponta a ponta.
 */
@TesteDeIntegracao
class FinanceiroERelatoriosApiTest {

    @Autowired
    private WebApplicationContext contexto;
    @Autowired
    private MedicoRepository medicos;
    @Autowired
    private JsonMapper json;
    @Autowired
    private Clock relogio;

    private MockMvc mvc;
    private Cenarios cenarios;
    private String admin;
    private Medico medico;
    private Paciente paciente;
    private LocalDate dia;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        admin = cenarios.bearer(cenarios.usuario("Financeiro de Teste", Papel.ADMIN));
        medico = cenarios.medico();
        medico.alterarPerfil(medico.getCrm(), medico.getCrmUf(), null, new BigDecimal("200.00"));
        medicos.save(medico);
        paciente = cenarios.paciente("Joana Cobrança " + UUID.randomUUID().toString().substring(0, 6), LocalDate.of(1990, 5, 1));
        dia = LocalDate.now(relogio).plusDays(3);
    }

    private ResultActions como(String bearer, MockHttpServletRequestBuilder requisicao) throws Exception {
        return mvc.perform(requisicao.header(HttpHeaders.AUTHORIZATION, bearer));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder requisicao, String corpo) {
        return requisicao.contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private void mudarStatus(Agendamento agendamento, String status) throws Exception {
        como(admin, json(patch("/api/admin/agendamentos/{id}/status", agendamento.getId()),
                "{\"status\":\"%s\"}".formatted(status))).andExpect(status().isOk());
    }

    /** Transações do paciente deste teste, como a administração vê. */
    private ResultActions doPaciente() throws Exception {
        return como(admin, get("/api/admin/financeiro/transacoes").param("q", paciente.getUsuario().getNomeCompleto()));
    }

    private String idDaPrimeira() throws Exception {
        String corpo = doPaciente().andReturn().getResponse().getContentAsString();
        return json.readTree(corpo).get("conteudo").get(0).get("id").asString();
    }

    @Nested
    @DisplayName("Cobrança de consultas")
    class Cobranca {

        @Test
        @DisplayName("confirmar a consulta gera cobrança pendente com o valor do médico")
        void confirmarGeraCobranca() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, paciente, dia, "09:00", StatusAgendamento.PENDENTE);
            mudarStatus(consulta, "confirmada");
            doPaciente()
                    .andExpect(jsonPath("$.conteudo", hasSize(1)))
                    .andExpect(jsonPath("$.conteudo[0].status").value("pendente"))
                    .andExpect(jsonPath("$.conteudo[0].valor").value(200.0))
                    .andExpect(jsonPath("$.conteudo[0].agendamentoId").value(consulta.getId().toString()))
                    .andExpect(jsonPath("$.conteudo[0].forma").isEmpty());
        }

        @Test
        @DisplayName("cancelar a consulta anula a cobrança pendente")
        void cancelarAnula() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, paciente, dia, "09:30", StatusAgendamento.PENDENTE);
            mudarStatus(consulta, "confirmada");
            mudarStatus(consulta, "cancelada");
            doPaciente()
                    .andExpect(jsonPath("$.conteudo[0].status").value("estornado"))
                    .andExpect(jsonPath("$.conteudo[0].pagoEm").isEmpty());
        }

        @Test
        @DisplayName("médico sem valor de consulta não gera cobrança")
        void semValor() throws Exception {
            Medico gratuito = cenarios.medico();
            Agendamento consulta = cenarios.agendamento(gratuito, paciente, dia, "10:00", StatusAgendamento.PENDENTE);
            mudarStatus(consulta, "confirmada");
            doPaciente().andExpect(jsonPath("$.conteudo", hasSize(0)));
        }

        @Test
        @DisplayName("baixa exige a forma; pago pode ser estornado uma vez; paciente vê as próprias cobranças")
        void baixaEEstorno() throws Exception {
            Agendamento consulta = cenarios.agendamento(medico, paciente, dia, "11:00", StatusAgendamento.PENDENTE);
            mudarStatus(consulta, "confirmada");
            String id = idDaPrimeira();

            como(admin, json(patch("/api/admin/financeiro/transacoes/{id}/status", id), "{\"status\":\"pago\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.forma").exists());
            como(admin, json(patch("/api/admin/financeiro/transacoes/{id}/status", id), "{\"status\":\"pago\",\"forma\":\"pix\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("pago"))
                    .andExpect(jsonPath("$.forma").value("pix"))
                    .andExpect(jsonPath("$.pagoEm").isNotEmpty());

            como(cenarios.bearer(paciente.getUsuario()), get("/api/paciente/pagamentos"))
                    .andExpect(jsonPath("$[0].status").value("pago"))
                    .andExpect(jsonPath("$[0].valor").value(200.0));

            como(admin, json(patch("/api/admin/financeiro/transacoes/{id}/status", id), "{\"status\":\"estornado\"}"))
                    .andExpect(jsonPath("$.status").value("estornado"));
            como(admin, json(patch("/api/admin/financeiro/transacoes/{id}/status", id), "{\"status\":\"estornado\"}"))
                    .andExpect(status().isUnprocessableContent());
        }

        @Test
        @DisplayName("lançamento manual já pago entra no recebido e na fatia da forma")
        void lancamentoManual() throws Exception {
            como(admin, json(post("/api/admin/financeiro/transacoes"),
                    "{\"pacienteId\":\"%s\",\"descricao\":\"Taxa\",\"valor\":50,\"jaPago\":true}".formatted(paciente.getId())))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.forma").exists());
            como(admin, json(post("/api/admin/financeiro/transacoes"),
                    "{\"pacienteId\":\"%s\",\"descricao\":\"Exame particular\",\"valor\":85.5,\"forma\":\"dinheiro\",\"jaPago\":true}"
                            .formatted(paciente.getId())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("pago"));

            como(admin, get("/api/admin/financeiro/resumo"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.recebido.atual").isNumber())
                    .andExpect(jsonPath("$.porForma[*].forma", hasItem("dinheiro")))
                    .andExpect(jsonPath("$.evolucao", hasSize(7)));
        }
    }

    @Nested
    @DisplayName("Relatórios e exportação")
    class Relatorios {

        @Test
        @DisplayName("resumo filtrado por médico conta agendamentos, atendimentos e faixa etária")
        void resumo() throws Exception {
            LocalDate ontem = LocalDate.now(relogio).minusDays(1);
            cenarios.agendamento(medico, paciente, ontem, "08:00", StatusAgendamento.REALIZADA);
            cenarios.agendamento(medico, paciente, ontem, "09:00", StatusAgendamento.CANCELADA);
            como(admin, get("/api/admin/relatorios/resumo").param("medicoId", medico.getId().toString())
                            .param("de", ontem.toString()).param("ate", ontem.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totais.agendamentos").value(2))
                    .andExpect(jsonPath("$.totais.atendimentos").value(1))
                    .andExpect(jsonPath("$.totais.cancelamentos").value(1))
                    .andExpect(jsonPath("$.totais.pacientes").value(1))
                    .andExpect(jsonPath("$.porEspecialidade[0].rotulo").value("Clínico Geral"))
                    .andExpect(jsonPath("$.faixaEtaria[?(@.rotulo == '31 a 50 anos')].total", hasItem(1)))
                    .andExpect(jsonPath("$.evolucao", hasSize(1)));
        }

        @Test
        @DisplayName("exporta CSV (com BOM e cabeçalho) e PDF")
        void exportacoes() throws Exception {
            cenarios.agendamento(medico, paciente, LocalDate.now(relogio).minusDays(1), "08:00", StatusAgendamento.REALIZADA);
            byte[] csv = como(admin, get("/api/admin/relatorios/exportar").param("tipo", "pacientes")
                            .param("medicoId", medico.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(header().string(HttpHeaders.CONTENT_TYPE, startsWith("text/csv")))
                    .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"relatorio-de-pacientes.csv\""))
                    .andReturn().getResponse().getContentAsByteArray();
            String texto = new String(csv, StandardCharsets.UTF_8);
            assertTrue(texto.startsWith("﻿Paciente;CPF;Idade"), texto);
            assertTrue(texto.contains(paciente.getUsuario().getNomeCompleto()));

            byte[] pdf = como(admin, get("/api/admin/relatorios/exportar").param("tipo", "agendamentos").param("formato", "pdf"))
                    .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"))
                    .andReturn().getResponse().getContentAsByteArray();
            assertEquals("%PDF-", new String(pdf, 0, 5, StandardCharsets.US_ASCII));

            como(admin, get("/api/admin/financeiro/exportar").param("formato", "excel"))
                    .andExpect(status().isOk())
                    .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"relatorio-financeiro.csv\""));
        }

        @Test
        @DisplayName("período invertido 400, tipo desconhecido 404, formato inválido 400")
        void validacoes() throws Exception {
            como(admin, get("/api/admin/relatorios/resumo").param("de", "2026-09-10").param("ate", "2026-09-01"))
                    .andExpect(status().isBadRequest());
            como(admin, get("/api/admin/relatorios/exportar").param("tipo", "salarios"))
                    .andExpect(status().isNotFound());
            como(admin, get("/api/admin/relatorios/exportar").param("tipo", "agendamentos").param("formato", "docx"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("recepção vê relatórios, mas não o financeiro nem a exportação financeira")
        void permissoes() throws Exception {
            String recepcao = cenarios.bearer(cenarios.usuario("Recepção Relatórios", Papel.RECEPCIONISTA));
            como(recepcao, get("/api/admin/relatorios/resumo")).andExpect(status().isOk());
            como(recepcao, get("/api/admin/financeiro/resumo")).andExpect(status().isForbidden());
            como(recepcao, get("/api/admin/financeiro/exportar")).andExpect(status().isForbidden());
        }
    }
}
