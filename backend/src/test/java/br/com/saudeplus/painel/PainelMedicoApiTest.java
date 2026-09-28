package br.com.saudeplus.painel;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.TesteDeIntegracao;

/**
 * Testa a API de ponta a ponta com os repositórios em memória reais, sem
 * mock nenhum, contra o Postgres do Testcontainers.
 *
 * O MockMvc é montado a partir do contexto web para não depender do
 * @AutoConfigureMockMvc, que muda de módulo entre versões do Spring Boot.
 */
@TesteDeIntegracao
class PainelMedicoApiTest {

    private static final String MEDICO = "med-1";

    @Autowired
    private WebApplicationContext contexto;

    private MockMvc mockMvc;

    private MockMvc mvc() {
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(contexto).build();
        }
        return mockMvc;
    }

    @Test
    @DisplayName("GET /painel devolve a tela inteira")
    void painelCompleto() throws Exception {
        mvc().perform(get("/api/medicos/{id}/painel", MEDICO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medico.nome").value("Dr. Carlos Mendes"))
                .andExpect(jsonPath("$.unidade.cidade").value("Saquarema"))
                .andExpect(jsonPath("$.dataReferencia").value("2026-09-15"))
                .andExpect(jsonPath("$.agenda.length()").value(8))
                .andExpect(jsonPath("$.pacientes.length()").value(5))
                .andExpect(jsonPath("$.examesPendentes.length()").value(3))
                .andExpect(jsonPath("$.notificacoes.length()").value(3));
    }

    @Test
    @DisplayName("os contadores do resumo vêm derivados dos dados")
    void resumoDerivado() throws Exception {
        mvc().perform(get("/api/medicos/{id}/painel", MEDICO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resumo.consultasHoje").value(8))
                .andExpect(jsonPath("$.resumo.pacientesAtendidos").value(3))
                .andExpect(jsonPath("$.resumo.examesPendentes").value(3))
                .andExpect(jsonPath("$.resumo.proximasConsultas").value(4))
                .andExpect(jsonPath("$.resumo.primeiroHorarioPendente").value("10:40"))
                .andExpect(jsonPath("$.contagemPorStatus.realizada").value(3))
                .andExpect(jsonPath("$.contagemPorStatus.em_andamento").value(1));
    }

    @Test
    @DisplayName("a consulta sai com horário formatado e paciente resolvido")
    void formatoDaConsulta() throws Exception {
        mvc().perform(get("/api/medicos/{id}/agenda", MEDICO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8))
                .andExpect(jsonPath("$[0].horario").value("08:00"))
                .andExpect(jsonPath("$[0].paciente").value("Ana Paula Ferreira"))
                .andExpect(jsonPath("$[0].status").value("realizada"));
    }

    @Test
    @DisplayName("o filtro de status funciona pela chave do domínio")
    void filtroDeStatus() throws Exception {
        mvc().perform(get("/api/medicos/{id}/agenda", MEDICO).param("status", "aguardando"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mvc().perform(get("/api/medicos/{id}/agenda", MEDICO).param("status", "todas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8));
    }

    @Test
    @DisplayName("status desconhecido devolve 400, não a agenda inteira")
    void statusInvalido() throws Exception {
        mvc().perform(get("/api/medicos/{id}/agenda", MEDICO).param("status", "cancelada"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("médico inexistente devolve 404 no formato de erro da API")
    void medicoInexistente() throws Exception {
        mvc().perform(get("/api/medicos/{id}/painel", "nao-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.erro").value("Not Found"))
                .andExpect(jsonPath("$.caminho").value("/api/medicos/nao-existe/painel"));
    }

    @Test
    @DisplayName("o limite de pacientes é respeitado")
    void limiteDePacientes() throws Exception {
        mvc().perform(get("/api/medicos/{id}/pacientes", MEDICO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(8))
                .andExpect(jsonPath("$[0].iniciais").value("AF"));

        mvc().perform(get("/api/medicos/{id}/pacientes", MEDICO).param("limite", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    @DisplayName("PATCH move a consulta de status")
    void mudaStatus() throws Exception {
        mvc().perform(patch("/api/agendamentos/{id}/status", "ag-7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"aguardando\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("ag-7"))
                .andExpect(jsonPath("$.status").value("aguardando"));
    }

    @Test
    @DisplayName("PATCH sem status devolve 400 com o campo apontado")
    void statusObrigatorio() throws Exception {
        mvc().perform(patch("/api/agendamentos/{id}/status", "ag-8")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.status").exists());
    }

    @Test
    @DisplayName("PATCH em consulta inexistente devolve 404")
    void consultaInexistente() throws Exception {
        mvc().perform(patch("/api/agendamentos/{id}/status", "nao-existe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"realizada\"}"))
                .andExpect(status().isNotFound());
    }
}
