package br.com.saudeplus.auth;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@ActiveProfiles("test")
class AuthApiTest {

	/** Captura os links de recuperacao em vez de escreve-los no log. */
	static class EmailCapturado implements EnviadorDeEmail {
		final List<String> links = new ArrayList<>();

		@Override
		public void enviarLinkDeRecuperacao(String destinatario, String nome, String link) {
			links.add(link);
		}
	}

	@TestConfiguration
	static class Config {
		@Bean
		@Primary
		EmailCapturado emailCapturado() {
			return new EmailCapturado();
		}
	}

	private static final Pattern TOKEN = Pattern.compile("\"token\"\\s*:\\s*\"([^\"]+)\"");

	@Autowired
	WebApplicationContext contexto;

	@Autowired
	EmailCapturado emails;

	MockMvc mvc;

	@BeforeEach
	void preparar() {
		mvc = MockMvcBuilders.webAppContextSetup(contexto).apply(springSecurity()).build();
		emails.links.clear();
	}

	// ---------- helpers ----------

	private static String emailNovo() {
		return "paciente-" + UUID.randomUUID() + "@exemplo.com";
	}

	private MockHttpServletRequestBuilder json(String caminho, String corpo) {
		return post(caminho).contentType(MediaType.APPLICATION_JSON).content(corpo);
	}

	private String cadastroJson(String email, String senha, String extra) {
		return "{\"nomeCompleto\":\"Maria Souza\",\"email\":\"" + email + "\",\"senha\":\"" + senha
				+ "\",\"telefone\":\"(24) 99999-0000\",\"aceiteTermos\":true" + extra + "}";
	}

	private String loginJson(String email, String senha) {
		return "{\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}";
	}

	private String tokenDe(String resposta) {
		Matcher m = TOKEN.matcher(resposta);
		assertTrue(m.find(), "resposta sem token: " + resposta);
		return m.group(1);
	}

	private String logar(String email, String senha) throws Exception {
		String corpo = mvc.perform(json("/api/auth/login", loginJson(email, senha)))
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
		return tokenDe(corpo);
	}

	// ---------- cadastro ----------

	@Test
	void cadastroCriaPacienteEIgnoraRoleEnviado() throws Exception {
		String email = emailNovo();
		mvc.perform(json("/api/auth/cadastro", cadastroJson(email, "umaSenhaForte1", ",\"role\":\"ADMIN\"")))
				.andExpect(status().isCreated())
				.andExpect(content().string(containsString("\"role\":\"PACIENTE\"")))
				.andExpect(content().string(containsString("\"tipo\":\"Bearer\"")))
				.andExpect(content().string(not(containsString("senha"))));
	}

	@Test
	void cadastroNormalizaEmailERejeitaDuplicado() throws Exception {
		String email = emailNovo();
		mvc.perform(json("/api/auth/cadastro", cadastroJson(email, "umaSenhaForte1", "")))
				.andExpect(status().isCreated());

		mvc.perform(json("/api/auth/cadastro", cadastroJson(email.toUpperCase(), "umaSenhaForte1", "")))
				.andExpect(status().isConflict());
	}

	@Test
	void cadastroValidaCampos() throws Exception {
		String corpo = "{\"nomeCompleto\":\"Ma\",\"email\":\"invalido\",\"senha\":\"curta\","
				+ "\"telefone\":\"abc\",\"aceiteTermos\":false}";
		mvc.perform(json("/api/auth/cadastro", corpo))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("\"campos\"")))
				.andExpect(content().string(containsString("\"nomeCompleto\"")))
				.andExpect(content().string(containsString("\"email\"")))
				.andExpect(content().string(containsString("\"senha\"")))
				.andExpect(content().string(containsString("\"telefone\"")))
				.andExpect(content().string(containsString("\"aceiteTermos\"")));
	}

	// ---------- login: contas fixas ----------

	@Test
	void adminFixoEntra() throws Exception {
		mvc.perform(json("/api/auth/login", loginJson("admin@saudeplus.com", "Admin@SaudePlus2026")))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString("\"role\":\"ADMIN\"")));
	}

	@Test
	void medicoFixoEntra() throws Exception {
		mvc.perform(json("/api/auth/login", loginJson("medico@saudeplus.com", "Medico@SaudePlus2026")))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString("\"role\":\"MEDICO\"")));
	}

	@Test
	void pacienteCriadoPodeEntrar() throws Exception {
		String email = emailNovo();
		mvc.perform(json("/api/auth/cadastro", cadastroJson(email, "umaSenhaForte1", "")))
				.andExpect(status().isCreated());
		mvc.perform(json("/api/auth/login", loginJson(email, "umaSenhaForte1")))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString("\"role\":\"PACIENTE\"")));
	}

	@Test
	void loginComSenhaErradaEEmailInexistenteDevolvemAMesmaMensagem() throws Exception {
		String senhaErrada = mvc.perform(json("/api/auth/login", loginJson("admin@saudeplus.com", "errada123")))
				.andExpect(status().isUnauthorized())
				.andReturn().getResponse().getContentAsString();
		String emailInexistente = mvc.perform(json("/api/auth/login", loginJson(emailNovo(), "errada123")))
				.andExpect(status().isUnauthorized())
				.andReturn().getResponse().getContentAsString();

		assertTrue(senhaErrada.contains("Dados incorretos. Confira o e-mail e a senha."));
		assertTrue(emailInexistente.contains("Dados incorretos. Confira o e-mail e a senha."));
	}

	// ---------- perfil e autorizacao por perfil ----------

	@Test
	void perfilExigeToken() throws Exception {
		mvc.perform(get("/api/auth/perfil")).andExpect(status().isUnauthorized());
		mvc.perform(get("/api/auth/perfil").header("Authorization", "Bearer token.invalido.aqui"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void perfilDevolveOUsuarioDoToken() throws Exception {
		String token = logar("medico@saudeplus.com", "Medico@SaudePlus2026");
		mvc.perform(get("/api/auth/perfil").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(content().string(containsString("medico@saudeplus.com")))
				.andExpect(content().string(containsString("\"role\":\"MEDICO\"")));
	}

	@Test
	void prefixosPorPerfilSaoAplicadosNoServidor() throws Exception {
		String admin = logar("admin@saudeplus.com", "Admin@SaudePlus2026");
		String medico = logar("medico@saudeplus.com", "Medico@SaudePlus2026");

		// sem token
		mvc.perform(get("/api/admin/qualquer")).andExpect(status().isUnauthorized());
		// perfil errado
		mvc.perform(get("/api/admin/qualquer").header("Authorization", "Bearer " + medico))
				.andExpect(status().isForbidden());
		mvc.perform(get("/api/medico/qualquer").header("Authorization", "Bearer " + admin))
				.andExpect(status().isForbidden());
		// perfil certo: passa da autorizacao (ainda nao ha controller, entao 404)
		mvc.perform(get("/api/admin/qualquer").header("Authorization", "Bearer " + admin))
				.andExpect(status().isNotFound());
	}

	// ---------- recuperacao de senha ----------

	@Test
	void recuperarSenhaRespondeIgualParaContaExistenteEInexistente() throws Exception {
		String email = emailNovo();
		mvc.perform(json("/api/auth/cadastro", cadastroJson(email, "umaSenhaForte1", "")))
				.andExpect(status().isCreated());

		String existente = mvc.perform(json("/api/auth/recuperar-senha", "{\"email\":\"" + email + "\"}"))
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
		String inexistente = mvc
				.perform(json("/api/auth/recuperar-senha", "{\"email\":\"" + emailNovo() + "\"}"))
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

		assertEquals(existente, inexistente);
		assertEquals(1, emails.links.size(), "so a conta existente recebe e-mail");
	}

	@Test
	void redefinirSenhaUsaTokenUmaVezSo() throws Exception {
		String email = emailNovo();
		mvc.perform(json("/api/auth/cadastro", cadastroJson(email, "senhaAntiga1", "")))
				.andExpect(status().isCreated());
		mvc.perform(json("/api/auth/recuperar-senha", "{\"email\":\"" + email + "\"}"))
				.andExpect(status().isOk());

		String link = emails.links.get(0);
		assertTrue(link.contains("/redefinir-senha?token="));
		String token = link.substring(link.indexOf("token=") + 6);

		mvc.perform(json("/api/auth/redefinir-senha", "{\"token\":\"" + token + "\",\"senha\":\"senhaNova123\"}"))
				.andExpect(status().isOk());

		mvc.perform(json("/api/auth/login", loginJson(email, "senhaNova123"))).andExpect(status().isOk());
		mvc.perform(json("/api/auth/login", loginJson(email, "senhaAntiga1"))).andExpect(status().isUnauthorized());

		// reutilizar o mesmo link falha
		mvc.perform(json("/api/auth/redefinir-senha", "{\"token\":\"" + token + "\",\"senha\":\"outraSenha123\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("Link inválido")));
	}

	@Test
	void redefinirSenhaComTokenInventadoFalha() throws Exception {
		mvc.perform(json("/api/auth/redefinir-senha", "{\"token\":\"inventado\",\"senha\":\"senhaNova123\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string(containsString("Link inválido")));
	}
}
