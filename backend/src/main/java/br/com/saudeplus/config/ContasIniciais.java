package br.com.saudeplus.config;

import br.com.saudeplus.auth.Role;
import br.com.saudeplus.auth.Usuario;
import br.com.saudeplus.auth.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Cria as contas fixas de admin e medico na inicializacao.
 *
 * So cria quando o e-mail ainda nao existe: reiniciar o servidor nunca
 * sobrescreve uma senha que ja tenha sido trocada.
 */
@Component
public class ContasIniciais implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(ContasIniciais.class);

	private final SaudePlusProperties propriedades;
	private final UsuarioRepository usuarios;
	private final PasswordEncoder encoder;

	public ContasIniciais(SaudePlusProperties propriedades, UsuarioRepository usuarios,
			PasswordEncoder encoder) {
		this.propriedades = propriedades;
		this.usuarios = usuarios;
		this.encoder = encoder;
	}

	@Override
	public void run(ApplicationArguments args) {
		var contas = propriedades.contasIniciais();
		if (contas == null) {
			return;
		}
		garantir(contas.admin(), Role.ADMIN);
		garantir(contas.medico(), Role.MEDICO);
	}

	private void garantir(SaudePlusProperties.Conta conta, Role role) {
		if (conta == null || vazio(conta.email()) || vazio(conta.senha())) {
			log.warn("Conta inicial de {} nao configurada; nada foi criado.", role);
			return;
		}
		int bytes = conta.senha().getBytes(StandardCharsets.UTF_8).length;
		if (conta.senha().length() < 8 || bytes > 72) {
			throw new IllegalStateException(
					"A senha inicial de " + role + " precisa ter de 8 a 72 caracteres.");
		}

		String email = conta.email().trim().toLowerCase(Locale.ROOT);
		if (usuarios.existsByEmail(email)) {
			return;
		}

		String nome = vazio(conta.nome()) ? role.name() : conta.nome().trim();
		usuarios.save(new Usuario(nome, email, encoder.encode(conta.senha()), null, role));
		log.info("Conta inicial de {} criada: {}", role, email);
	}

	private static boolean vazio(String valor) {
		return valor == null || valor.isBlank();
	}
}
