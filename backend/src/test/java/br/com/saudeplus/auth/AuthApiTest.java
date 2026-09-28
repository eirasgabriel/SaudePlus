package br.com.saudeplus.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.StatusConta;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;
import tools.jackson.databind.json.JsonMapper;

/**
 * Contrato de `docs/api.md` de ponta a ponta, contra o Postgres do
 * Testcontainers. O banco é compartilhado entre as classes de teste, então
 * cada cenário cria contas com e-mail único.
 */
@TesteDeIntegracao
class AuthApiTest {

    private static final String SENHA = "umaSenhaForte1";

    @Autowired
    private WebApplicationContext contexto;

    @Autowired
    private JsonMapper json;

    @Autowired
    private UsuarioRepository usuarios;

    @Autowired
    private PacienteRepository pacientes;

    @Autowired
    private TokenRedefinicaoSenhaRepository tokens;

    private MockMvc mockMvc;

    private MockMvc mvc() {
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
        }
        return mockMvc;
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class Login {

        @Test
        @DisplayName("conta inicial de admin entra e recebe o token com o papel")
        void adminEntra() throws Exception {
            entrar("admin@saudeplus.com", "Admin@SaudePlus2026")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.tipo").value("Bearer"))
                    .andExpect(jsonPath("$.expiraEmSegundos").value(28800))
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.usuario.role").value("ADMIN"))
                    .andExpect(jsonPath("$.usuario.nomeCompleto").value("Administrador SaudePlus"));
        }

        @Test
        @DisplayName("e-mail é comparado sem diferenciar maiúsculas")
        void emailSemCaixa() throws Exception {
            entrar("MEDICO@SaudePlus.com", "Medico@SaudePlus2026")
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.usuario.role").value("MEDICO"));
        }

        @Test
        @DisplayName("senha errada e e-mail inexistente dão o mesmo 401")
        void credenciaisInvalidas() throws Exception {
            entrar("admin@saudeplus.com", "senhaErrada123")
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.mensagem").value(AuthService.CREDENCIAIS_INVALIDAS));
            entrar("ninguem-" + UUID.randomUUID() + "@exemplo.com", "senhaErrada123")
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.mensagem").value(AuthService.CREDENCIAIS_INVALIDAS));
        }

        @Test
        @DisplayName("conta bloqueada com a senha certa recebe 403")
        void contaBloqueada() throws Exception {
            String email = cadastrarPaciente();
            bloquear(email);
            entrar(email, SENHA).andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("corpo sem e-mail devolve 400 com o campo")
        void validacao() throws Exception {
            enviar("/api/auth/login", "{\"senha\":\"x\"}")
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.email").exists());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/cadastro")
    class Cadastro {

        @Test
        @DisplayName("cria paciente, ignora role enviado pelo cliente e já devolve o token")
        void criaPaciente() throws Exception {
            String email = "Maria." + UUID.randomUUID() + "@Exemplo.com";
            enviar("/api/auth/cadastro", """
                    {"nomeCompleto":"Maria Souza","email":"%s","senha":"%s","telefone":"(24) 99999-0000",
                     "aceiteTermos":true,"role":"ADMIN"}""".formatted(email, SENHA))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").isNotEmpty())
                    .andExpect(jsonPath("$.usuario.role").value("PACIENTE"))
                    .andExpect(jsonPath("$.usuario.email").value(email.toLowerCase()));

            Usuario salvo = usuarios.findByEmail(email.toLowerCase()).orElseThrow();
            assertEquals(Papel.PACIENTE, salvo.getPapel());
            assertTrue(pacientes.findByUsuarioId(salvo.getId()).isPresent(), "perfil de paciente criado junto");
        }

        @Test
        @DisplayName("e-mail já cadastrado devolve 409")
        void emailDuplicado() throws Exception {
            String email = cadastrarPaciente();
            enviar("/api/auth/cadastro", corpoDeCadastro(email.toUpperCase()))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("campos inválidos voltam em `campos` com 400")
        void camposInvalidos() throws Exception {
            enviar("/api/auth/cadastro", """
                    {"nomeCompleto":"Al","email":"nao-e-email","senha":"curta","telefone":"abc","aceiteTermos":false}""")
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.nomeCompleto").exists())
                    .andExpect(jsonPath("$.campos.email").exists())
                    .andExpect(jsonPath("$.campos.senha").exists())
                    .andExpect(jsonPath("$.campos.telefone").exists())
                    .andExpect(jsonPath("$.campos.aceiteTermos").exists());
        }
    }

    @Nested
    @DisplayName("Perfil e autorização por rota")
    class Autorizacao {

        @Test
        @DisplayName("GET /perfil sem token devolve 401 no formato de erro da API")
        void semToken() throws Exception {
            mvc().perform(get("/api/auth/perfil"))
                    .andExpect(status().isUnauthorized())
                    .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
                    .andExpect(jsonPath("$.status").value(401))
                    .andExpect(jsonPath("$.mensagem").isNotEmpty());
        }

        @Test
        @DisplayName("token adulterado devolve 401")
        void tokenAdulterado() throws Exception {
            String token = tokenDe(cadastrarPaciente());
            mvc().perform(get("/api/auth/perfil").header(HttpHeaders.AUTHORIZATION, "Bearer " + token + "x"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("GET /perfil com token devolve o usuário do token")
        void comToken() throws Exception {
            String email = cadastrarPaciente();
            mvc().perform(get("/api/auth/perfil").header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenDe(email)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value(email))
                    .andExpect(jsonPath("$.role").value("PACIENTE"));
        }

        @Test
        @DisplayName("paciente não entra em rotas de admin nem do painel do médico")
        void pacienteBarrado() throws Exception {
            String bearer = "Bearer " + tokenDe(cadastrarPaciente());
            mvc().perform(get("/api/admin/dashboard").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status").value(403));
            mvc().perform(get("/api/medicos/med-1/painel").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("bloquear a conta derruba o token já emitido")
        void bloqueioValeNaHora() throws Exception {
            String email = cadastrarPaciente();
            String bearer = "Bearer " + tokenDe(email);
            bloquear(email);
            mvc().perform(get("/api/auth/perfil").header(HttpHeaders.AUTHORIZATION, bearer))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("PUT /perfil atualiza nome e telefone")
        void atualizaPerfil() throws Exception {
            String email = cadastrarPaciente();
            mvc().perform(put("/api/auth/perfil")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenDe(email))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"nomeCompleto\":\"Maria Souza Lima\",\"telefone\":\"(21) 98888-7777\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nomeCompleto").value("Maria Souza Lima"))
                    .andExpect(jsonPath("$.telefone").value("(21) 98888-7777"));
        }

        @Test
        @DisplayName("PUT /senha com a senha atual errada aponta o campo, sem 401")
        void trocaDeSenha() throws Exception {
            String email = cadastrarPaciente();
            String bearer = "Bearer " + tokenDe(email);
            mvc().perform(put("/api/auth/senha").header(HttpHeaders.AUTHORIZATION, bearer)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"senhaAtual\":\"errada123\",\"novaSenha\":\"outraSenha99\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.campos.senhaAtual").exists());
            mvc().perform(put("/api/auth/senha").header(HttpHeaders.AUTHORIZATION, bearer)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"senhaAtual\":\"%s\",\"novaSenha\":\"outraSenha99\"}".formatted(SENHA)))
                    .andExpect(status().isOk());
            entrar(email, "outraSenha99").andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Recuperação de senha")
    class Recuperacao {

        private static final String MENSAGEM_NEUTRA =
                "Se existir uma conta com este e-mail, enviamos as instruções de recuperação.";

        @Test
        @DisplayName("responde igual exista ou não a conta, mas só gera link para a que existe")
        void respostaNeutra() throws Exception {
            String email = cadastrarPaciente();
            long antes = tokens.count();

            enviar("/api/auth/recuperar-senha", "{\"email\":\"%s\"}".formatted(email))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.mensagem").value(MENSAGEM_NEUTRA));
            enviar("/api/auth/recuperar-senha", "{\"email\":\"ninguem-%s@exemplo.com\"}".formatted(UUID.randomUUID()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.mensagem").value(MENSAGEM_NEUTRA));

            assertEquals(antes + 1, tokens.count());
        }

        @Test
        @DisplayName("link válido troca a senha uma única vez")
        void usoUnico() throws Exception {
            String email = cadastrarPaciente();
            String token = criarToken(email, Instant.now().plus(30, ChronoUnit.MINUTES));

            redefinir(token, "novaSenha123").andExpect(status().isOk());
            entrar(email, "novaSenha123").andExpect(status().isOk());

            redefinir(token, "maisUmaSenha1")
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.erro").value("Link inválido"));
        }

        @Test
        @DisplayName("link expirado ou inventado é recusado como Link inválido")
        void expiradoOuInventado() throws Exception {
            String email = cadastrarPaciente();
            String expirado = criarToken(email, Instant.now().minus(1, ChronoUnit.MINUTES));

            redefinir(expirado, "novaSenha123")
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.erro").value("Link inválido"));
            redefinir("token-que-nunca-existiu", "novaSenha123")
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.erro").value("Link inválido"));
            entrar(email, SENHA).andExpect(status().isOk());
        }

        private String criarToken(String email, Instant expiraEm) {
            Usuario usuario = usuarios.findByEmail(email).orElseThrow();
            String emClaro = TokenRedefinicaoSenha.gerarTokenEmClaro();
            tokens.save(new TokenRedefinicaoSenha(usuario, emClaro, Instant.now(), expiraEm));
            return emClaro;
        }

        private ResultActions redefinir(String token, String senha) throws Exception {
            return enviar("/api/auth/redefinir-senha", "{\"token\":\"%s\",\"senha\":\"%s\"}".formatted(token, senha));
        }
    }

    // ---------------------------------------------------------------------

    private ResultActions enviar(String caminho, String corpo) throws Exception {
        return mvc().perform(post(caminho).contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions entrar(String email, String senha) throws Exception {
        return enviar("/api/auth/login", "{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(email, senha));
    }

    private static String corpoDeCadastro(String email) {
        return """
                {"nomeCompleto":"Paciente de Teste","email":"%s","senha":"%s","aceiteTermos":true}"""
                .formatted(email, SENHA);
    }

    /** Cadastra um paciente novo pela API e devolve o e-mail (já normalizado). */
    private String cadastrarPaciente() throws Exception {
        String email = "paciente-" + UUID.randomUUID() + "@exemplo.com";
        enviar("/api/auth/cadastro", corpoDeCadastro(email)).andExpect(status().isCreated());
        return email;
    }

    private String tokenDe(String email) throws Exception {
        String corpo = entrar(email, SENHA).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(corpo).get("token").asString();
    }

    private void bloquear(String email) {
        Usuario usuario = usuarios.findByEmail(email).orElseThrow();
        usuario.alterarStatus(StatusConta.BLOQUEADO);
        usuarios.save(usuario);
    }
}
