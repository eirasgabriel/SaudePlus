package br.com.saudeplus.exception;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsStringIgnoringCase;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.Cenarios;
import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.usuarios.Papel;

/**
 * Erros do próprio Spring MVC (método, parâmetro, tipo de conteúdo) saem com o
 * status certo e no formato de `docs/api.md`, sem virar 500 nem mostrar o nome
 * da exceção para o cliente.
 */
@TesteDeIntegracao
class ErrosDaApiTest {

    @Autowired
    private WebApplicationContext contexto;

    private MockMvc mvc;
    private String admin;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        Cenarios cenarios = new Cenarios(contexto);
        admin = cenarios.bearer(cenarios.usuario("Administração de Teste", Papel.ADMIN));
    }

    private static void semDetalheTecnico(ResultActions resposta) throws Exception {
        resposta.andExpect(jsonPath("$.mensagem", not(containsStringIgnoringCase("exception"))))
                .andExpect(jsonPath("$.mensagem", not(containsStringIgnoringCase("org.springframework"))));
    }

    @Test
    void metodoNaoSuportadoResponde405() throws Exception {
        ResultActions resposta = mvc.perform(post("/api/publico/especialidades"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405))
                .andExpect(jsonPath("$.caminho").value("/api/publico/especialidades"));
        semDetalheTecnico(resposta);
    }

    @Test
    void parametroObrigatorioAusenteResponde400() throws Exception {
        ResultActions resposta = mvc.perform(get("/api/admin/relatorios/exportar").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.mensagem", containsStringIgnoringCase("tipo")));
        semDetalheTecnico(resposta);
    }

    @Test
    void tipoDeConteudoNaoSuportadoResponde415() throws Exception {
        ResultActions resposta = mvc.perform(post("/api/auth/login").contentType(MediaType.TEXT_PLAIN).content("x"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.status").value(415));
        semDetalheTecnico(resposta);
    }

    @Test
    void idMalformadoNoCaminhoResponde400() throws Exception {
        mvc.perform(get("/api/publico/profissionais/nao-e-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
