package br.com.saudeplus.admin;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import br.com.saudeplus.Cenarios;
import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.UsuarioRepository;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import tools.jackson.databind.json.JsonMapper;

@TesteDeIntegracao
class AcessoClinicaApiTest {
    @Autowired WebApplicationContext contexto;
    @Autowired JsonMapper json;
    @Autowired UsuarioRepository usuarios;
    @Autowired AgendamentoRepository agendamentos;
    MockMvc mvc;
    Cenarios cenarios;
    String admin;

    @BeforeEach void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        admin = cenarios.bearer(cenarios.usuario("Admin Teste", Papel.ADMIN));
    }

    String dados(String email, String senha) {
        return """
            {"nome":"Clínica Teste","endereco":"Rua de Teste, 1","cidade":"Cidade de Teste","uf":"RJ",
             "emailLogin":"%s","senhaLogin":"%s"}
            """.formatted(email, senha);
    }

    String criar(String email) throws Exception {
        return json.readTree(mvc.perform(post("/api/admin/unidades").header(HttpHeaders.AUTHORIZATION, admin)
            .contentType(MediaType.APPLICATION_JSON).content(dados(email, "senhaTeste123")))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.emailLogin").value(email.toLowerCase()))
            .andExpect(jsonPath("$.senhaLogin").doesNotExist()).andReturn().getResponse().getContentAsString())
            .get("id").asString();
    }

    String entrar(String email, String senha) throws Exception {
        return "Bearer " + json.readTree(mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(email, senha)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.usuario.role").value("CLINICA"))
            .andReturn().getResponse().getContentAsString()).get("token").asString();
    }

    @Test void loginIsolamentoESuspensao() throws Exception {
        String email = "clinica-" + UUID.randomUUID() + "@teste.com";
        String id = criar(email);
        String bearer = entrar(email.toUpperCase(), "senhaTeste123");
        mvc.perform(get("/api/clinica/painel").header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isOk()).andExpect(jsonPath("$.unidades", hasSize(1)))
            .andExpect(jsonPath("$.unidades[0].id").value(id));
        var medico = cenarios.medico();
        var paciente = cenarios.paciente("Paciente Teste", LocalDate.of(1990, 1, 1));
        var data = LocalDate.of(2090, 8, 15);
        cenarios.agendamento(medico, paciente, data, "08:00", StatusAgendamento.CONFIRMADA);
        mvc.perform(get("/api/clinica/agendamentos").header(HttpHeaders.AUTHORIZATION, bearer)
            .param("de", data.toString()).param("ate", data.toString()).param("unidadeId", Cenarios.UNIDADE_CENTRO.toString()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.totalElementos").value(0));
        mvc.perform(get("/api/admin/unidades").header(HttpHeaders.AUTHORIZATION, bearer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/agendamentos").header(HttpHeaders.AUTHORIZATION, bearer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/paciente/painel").header(HttpHeaders.AUTHORIZATION, bearer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/clinica/painel").header(HttpHeaders.AUTHORIZATION, admin)).andExpect(status().isForbidden());
        mvc.perform(put("/api/admin/unidades/{id}", id).header(HttpHeaders.AUTHORIZATION, admin)
            .contentType(MediaType.APPLICATION_JSON).content(dados(email, ""))).andExpect(status().isOk());
        entrar(email, "senhaTeste123");
        mvc.perform(patch("/api/admin/unidades/{id}/status", id).header(HttpHeaders.AUTHORIZATION, admin)
            .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"inativa\"}")).andExpect(status().isOk());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"%s\",\"senha\":\"senhaTeste123\"}".formatted(email))).andExpect(status().isForbidden());
        mvc.perform(get("/api/clinica/painel").header(HttpHeaders.AUTHORIZATION, bearer)).andExpect(status().isUnauthorized());
    }

    @Test void adminTrocaOEmailDeLoginDaClinica() throws Exception {
        String antigo = "clinica-" + UUID.randomUUID() + "@teste.com";
        String novo = "clinica-nova-" + UUID.randomUUID() + "@teste.com";
        String id = criar(antigo);
        mvc.perform(put("/api/admin/unidades/{id}", id).header(HttpHeaders.AUTHORIZATION, admin)
            .contentType(MediaType.APPLICATION_JSON).content(dados(novo, "")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.emailLogin").value(novo));
        // A listagem do painel de clínicas já mostra o e-mail novo.
        mvc.perform(get("/api/admin/unidades").header(HttpHeaders.AUTHORIZATION, admin))
            .andExpect(jsonPath("$[?(@.id == '%s')].emailLogin".formatted(id)).value(novo));
        // A senha continua a mesma; só o login mudou.
        entrar(novo, "senhaTeste123");
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"%s\",\"senha\":\"senhaTeste123\"}".formatted(antigo))).andExpect(status().isUnauthorized());
    }

    @Test void clinicaTrocaAPropriaSenhaConferindoAAtual() throws Exception {
        String email = "clinica-" + UUID.randomUUID() + "@teste.com";
        criar(email);
        String bearer = entrar(email, "senhaTeste123");
        mvc.perform(put("/api/auth/senha").header(HttpHeaders.AUTHORIZATION, bearer).contentType(MediaType.APPLICATION_JSON)
            .content("{\"senhaAtual\":\"errada123\",\"novaSenha\":\"novaSenha456\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.senhaAtual").value("A senha atual não confere."));
        mvc.perform(put("/api/auth/senha").header(HttpHeaders.AUTHORIZATION, bearer).contentType(MediaType.APPLICATION_JSON)
            .content("{\"senhaAtual\":\"senhaTeste123\",\"novaSenha\":\"curta\"}"))
            .andExpect(status().isBadRequest());
        mvc.perform(put("/api/auth/senha").header(HttpHeaders.AUTHORIZATION, bearer).contentType(MediaType.APPLICATION_JSON)
            .content("{\"senhaAtual\":\"senhaTeste123\",\"novaSenha\":\"novaSenha456\"}"))
            .andExpect(status().isOk());
        entrar(email, "novaSenha456");
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"%s\",\"senha\":\"senhaTeste123\"}".formatted(email))).andExpect(status().isUnauthorized());
    }

    @Test void adminRedefineASenhaDaClinica() throws Exception {
        String email = "clinica-" + UUID.randomUUID() + "@teste.com";
        String id = criar(email);
        mvc.perform(put("/api/admin/unidades/{id}", id).header(HttpHeaders.AUTHORIZATION, admin)
            .contentType(MediaType.APPLICATION_JSON).content(dados(email, "curta")))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.senhaLogin").exists());
        mvc.perform(put("/api/admin/unidades/{id}", id).header(HttpHeaders.AUTHORIZATION, admin)
            .contentType(MediaType.APPLICATION_JSON).content(dados(email, "senhaDoAdmin789")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.senhaLogin").doesNotExist());
        entrar(email, "senhaDoAdmin789");
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"%s\",\"senha\":\"senhaTeste123\"}".formatted(email))).andExpect(status().isUnauthorized());
    }

    @Test void emailUnicoESenhaObrigatoria() throws Exception {
        var existente = cenarios.usuario("Outra conta", Papel.PACIENTE);
        long antes = usuarios.count();
        mvc.perform(post("/api/admin/unidades").header(HttpHeaders.AUTHORIZATION, admin).contentType(MediaType.APPLICATION_JSON)
            .content(dados(existente.getEmail(), "senhaTeste123"))).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.campos.emailLogin").exists());
        org.junit.jupiter.api.Assertions.assertEquals(antes, usuarios.count());
        mvc.perform(post("/api/admin/unidades").header(HttpHeaders.AUTHORIZATION, admin).contentType(MediaType.APPLICATION_JSON)
            .content(dados("sem-senha-" + UUID.randomUUID() + "@teste.com", ""))).andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.campos.senhaLogin").exists());
    }

    @Test void corpoClinicoDaPropriaUnidade() throws Exception {
        String email = "clinica-" + UUID.randomUUID() + "@teste.com";
        String unidadeId = criar(email);
        String bearer = entrar(email, "senhaTeste123");
        String outraEmail = "clinica-" + UUID.randomUUID() + "@teste.com";
        criar(outraEmail);
        String outra = entrar(outraEmail, "senhaTeste123");
        var medico = cenarios.medico();
        String id = medico.getId().toString();

        mvc.perform(get("/api/clinica/medicos").header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/clinica/medicos/disponiveis").param("busca", "x").header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isUnprocessableContent());
        mvc.perform(get("/api/clinica/medicos/disponiveis").param("busca", medico.getCrm()).header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1))).andExpect(jsonPath("$[0].id").value(id))
            .andExpect(jsonPath("$[0].vinculado").value(false));

        String vinculo = "{\"medicoId\":\"%s\"}".formatted(id);
        mvc.perform(post("/api/clinica/medicos").header(HttpHeaders.AUTHORIZATION, bearer)
            .contentType(MediaType.APPLICATION_JSON).content(vinculo))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.vinculado").value(true));
        mvc.perform(post("/api/clinica/medicos").header(HttpHeaders.AUTHORIZATION, bearer)
            .contentType(MediaType.APPLICATION_JSON).content(vinculo)).andExpect(status().isConflict());
        mvc.perform(get("/api/clinica/medicos").header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(jsonPath("$", hasSize(1))).andExpect(jsonPath("$[0].crm").value(medico.getCrm()));
        mvc.perform(get("/api/clinica/medicos/disponiveis").param("busca", medico.getCrm()).header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(jsonPath("$", hasSize(0)));
        // A outra clínica não enxerga nem desfaz o vínculo alheio.
        mvc.perform(get("/api/clinica/medicos").header(HttpHeaders.AUTHORIZATION, outra)).andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(delete("/api/clinica/medicos/{id}", id).header(HttpHeaders.AUTHORIZATION, outra)).andExpect(status().isNotFound());
        mvc.perform(get("/api/clinica/medicos").header(HttpHeaders.AUTHORIZATION, admin)).andExpect(status().isForbidden());

        var paciente = cenarios.paciente("Paciente Teste", LocalDate.of(1990, 1, 1));
        var consulta = cenarios.agendamento(medico, paciente, LocalDate.of(2090, 9, 1), "09:00",
            StatusAgendamento.CONFIRMADA, UUID.fromString(unidadeId));
        mvc.perform(delete("/api/clinica/medicos/{id}", id).header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isUnprocessableContent());
        consulta.mudarStatus(StatusAgendamento.CANCELADA);
        agendamentos.save(consulta);
        mvc.perform(delete("/api/clinica/medicos/{id}", id).header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(status().isNoContent());
        mvc.perform(get("/api/clinica/medicos").header(HttpHeaders.AUTHORIZATION, bearer)).andExpect(jsonPath("$", hasSize(0)));
        // O vínculo com a unidade original do médico continua intacto.
        mvc.perform(get("/api/clinica/medicos/disponiveis").param("busca", medico.getCrm()).header(HttpHeaders.AUTHORIZATION, bearer))
            .andExpect(jsonPath("$", hasSize(1)));
    }
}
