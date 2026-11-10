package br.com.saudeplus.areapaciente;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import br.com.saudeplus.comum.Cpf;
import br.com.saudeplus.pacientes.Paciente;
import tools.jackson.databind.json.JsonMapper;

/** "Minhas informações" do paciente (`/api/paciente/perfil`). */
@TesteDeIntegracao
class PerfilDoPacienteApiTest {

    @Autowired
    private WebApplicationContext contexto;
    @Autowired
    private JsonMapper json;
    @Autowired
    private Clock relogio;

    private MockMvc mvc;
    private Cenarios cenarios;
    private Paciente paciente;
    private String bearer;
    private String unimed;

    @BeforeEach
    void preparar() throws Exception {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        cenarios = new Cenarios(contexto);
        paciente = cenarios.paciente("Lívia Rocha Antunes", null);
        bearer = cenarios.bearer(paciente.getUsuario());
        String convenios = mvc.perform(get("/api/publico/convenios")).andReturn().getResponse().getContentAsString();
        for (var item : json.readTree(convenios)) {
            if ("Unimed".equals(item.get("nome").asString())) {
                unimed = item.get("id").asString();
            }
        }
    }

    private ResultActions atualizar(String token, String corpo) throws Exception {
        return mvc.perform(put("/api/paciente/perfil").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions ler(String token) throws Exception {
        return mvc.perform(get("/api/paciente/perfil").header(HttpHeaders.AUTHORIZATION, token));
    }

    /** CPF válido e diferente a cada chamada: o banco é compartilhado entre as classes de teste. */
    private static String cpfNovo() {
        return Cpf.comDigitosVerificadores("%09d".formatted(ThreadLocalRandom.current().nextInt(100_000_000, 999_999_999)));
    }

    private static MockHttpServletRequestBuilder semToken() {
        return get("/api/paciente/perfil");
    }

    @Test
    @DisplayName("preenche nascimento, sexo, CPF e convênio; a idade sai calculada")
    void atualiza() throws Exception {
        ler(bearer).andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Lívia Rocha Antunes"))
                .andExpect(jsonPath("$.cpf").isEmpty())
                .andExpect(jsonPath("$.convenio").isEmpty());

        String cpf = cpfNovo();
        LocalDate nascimento = LocalDate.now(relogio).minusYears(30).minusDays(1);
        atualizar(bearer, """
                {"nomeCompleto":"Lívia Rocha Antunes","telefone":"(22) 90000-1111","dataNascimento":"%s",
                 "sexo":"feminino","cpf":"%s","convenioId":"%s","numeroCarteirinha":" 0001-ABC "}"""
                .formatted(nascimento, cpf.replaceAll("\\D", ""), unimed))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(cpf))
                .andExpect(jsonPath("$.idade").value(30))
                .andExpect(jsonPath("$.sexo").value("feminino"))
                .andExpect(jsonPath("$.convenio.nome").value("Unimed"))
                .andExpect(jsonPath("$.numeroCarteirinha").value("0001-ABC"));

        // Sem convênio, a carteirinha some; CPF omitido mantém o gravado.
        atualizar(bearer, "{\"nomeCompleto\":\"Lívia R. Antunes\",\"numeroCarteirinha\":\"0001-ABC\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Lívia R. Antunes"))
                .andExpect(jsonPath("$.cpf").value(cpf))
                .andExpect(jsonPath("$.convenio").isEmpty())
                .andExpect(jsonPath("$.numeroCarteirinha").isEmpty());
    }

    @Test
    @DisplayName("CPF gravado não muda por aqui (422); CPF de outra conta dá 409")
    void cpf() throws Exception {
        String cpf = cpfNovo();
        atualizar(bearer, "{\"nomeCompleto\":\"Lívia Rocha Antunes\",\"cpf\":\"%s\"}".formatted(cpf))
                .andExpect(status().isOk());
        atualizar(bearer, "{\"nomeCompleto\":\"Lívia Rocha Antunes\",\"cpf\":\"%s\"}".formatted(cpfNovo()))
                .andExpect(status().isUnprocessableContent());

        String outro = cenarios.bearer(cenarios.paciente("Outra Pessoa", null).getUsuario());
        atualizar(outro, "{\"nomeCompleto\":\"Outra Pessoa\",\"cpf\":\"%s\"}".formatted(cpf))
                .andExpect(status().isConflict());
        // Os dados de uma conta não aparecem na outra.
        ler(outro).andExpect(jsonPath("$.cpf").isEmpty()).andExpect(jsonPath("$.nome").value("Outra Pessoa"));
    }

    @Test
    @DisplayName("sexo, nascimento futuro, CPF e convênio inválidos dão 400 no campo")
    void validacao() throws Exception {
        atualizar(bearer, "{\"nomeCompleto\":\"Lívia\",\"sexo\":\"x\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.sexo").exists());
        atualizar(bearer, "{\"nomeCompleto\":\"Lívia\",\"dataNascimento\":\"%s\"}"
                .formatted(LocalDate.now(relogio).plusDays(1)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.dataNascimento").exists());
        atualizar(bearer, "{\"nomeCompleto\":\"Lívia\",\"cpf\":\"111.222.333-44\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.cpf").exists());
        atualizar(bearer, "{\"nomeCompleto\":\"Lívia\",\"convenioId\":\"%s\"}".formatted(UUID.randomUUID()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.convenioId").exists());
        atualizar(bearer, "{\"nomeCompleto\":\"\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.campos.nomeCompleto").exists());
    }

    @Test
    @DisplayName("sem token 401; médico 403")
    void acesso() throws Exception {
        mvc.perform(semToken()).andExpect(status().isUnauthorized());
        mvc.perform(semToken().header(HttpHeaders.AUTHORIZATION, cenarios.bearer(cenarios.medico())))
                .andExpect(status().isForbidden());
    }
}
