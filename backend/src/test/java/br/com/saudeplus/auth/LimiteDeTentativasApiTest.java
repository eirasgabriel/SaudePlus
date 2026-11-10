package br.com.saudeplus.auth;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.TesteDeIntegracao;

/**
 * Limites de tentativa com valores baixos, num contexto só deste teste (os
 * demais testes rodam com limites altos, porque dividem o mesmo IP).
 */
@TesteDeIntegracao
@TestPropertySource(properties = {
    "saudeplus.limites.login-por-conta.maximo=3",
    "saudeplus.limites.login-por-ip.maximo=6",
    "saudeplus.limites.recuperacao-por-conta.maximo=2",
    "saudeplus.limites.recuperacao-por-ip.maximo=4",
})
class LimiteDeTentativasApiTest {

    private static final String SENHA_ADMIN = "Admin@SaudePlus2026";

    @Autowired
    private WebApplicationContext contexto;

    private MockMvc mvc;

    @BeforeEach
    void preparar() {
        mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
    }

    private ResultActions login(String ip, String email, String senha) throws Exception {
        return mvc.perform(post("/api/auth/login").with(r -> {
            r.setRemoteAddr(ip);
            return r;
        }).contentType(MediaType.APPLICATION_JSON).content("""
                {"email": "%s", "senha": "%s"}""".formatted(email, senha)));
    }

    private ResultActions recuperar(String ip, String email) throws Exception {
        return mvc.perform(post("/api/auth/recuperar-senha").with(r -> {
            r.setRemoteAddr(ip);
            return r;
        }).contentType(MediaType.APPLICATION_JSON).content("""
                {"email": "%s"}""".formatted(email)));
    }

    @Test
    void falhasDeLoginBloqueiamOParIpEmailAteASenhaCertaTambem() throws Exception {
        String ip = "10.0.0.1";
        for (int i = 0; i < 3; i++) {
            login(ip, "admin@saudeplus.com", "senhaErrada1").andExpect(status().isUnauthorized());
        }
        login(ip, "admin@saudeplus.com", SENHA_ADMIN)
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.mensagem", containsString("Aguarde")));
        // Outro IP não herda o bloqueio.
        login("10.0.0.2", "admin@saudeplus.com", SENHA_ADMIN).andExpect(status().isOk());
    }

    @Test
    void loginCertoZeraAsFalhasDaquelaConta() throws Exception {
        String ip = "10.0.0.3";
        login(ip, "admin@saudeplus.com", "senhaErrada1").andExpect(status().isUnauthorized());
        login(ip, "admin@saudeplus.com", "senhaErrada1").andExpect(status().isUnauthorized());
        login(ip, "admin@saudeplus.com", SENHA_ADMIN).andExpect(status().isOk());
        login(ip, "admin@saudeplus.com", "senhaErrada1").andExpect(status().isUnauthorized());
        login(ip, "admin@saudeplus.com", "senhaErrada1").andExpect(status().isUnauthorized());
        login(ip, "admin@saudeplus.com", SENHA_ADMIN).andExpect(status().isOk());
    }

    @Test
    void muitasFalhasDoMesmoIpEmContasDiferentesTambemBloqueiam() throws Exception {
        String ip = "10.0.0.4";
        for (int i = 0; i < 6; i++) {
            login(ip, "alguem" + i + "@teste.saudeplus.com", "senhaErrada1").andExpect(status().isUnauthorized());
        }
        login(ip, "outra@teste.saudeplus.com", "senhaErrada1").andExpect(status().isTooManyRequests());
    }

    @Test
    void recuperacaoDeSenhaLimitadaPorEmailExistaAContaOuNao() throws Exception {
        for (String email : new String[] { "admin@saudeplus.com", "ninguem@teste.saudeplus.com" }) {
            recuperar("10.0.1.1", email).andExpect(status().isOk());
            recuperar("10.0.1.2", email).andExpect(status().isOk());
            recuperar("10.0.1.3", email).andExpect(status().isTooManyRequests());
        }
    }
}
