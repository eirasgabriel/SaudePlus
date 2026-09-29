package br.com.saudeplus.auth;

import br.com.saudeplus.auth.dto.AuthResponse;
import br.com.saudeplus.auth.dto.CadastroRequest;
import br.com.saudeplus.auth.dto.LoginRequest;
import br.com.saudeplus.auth.dto.RecuperarSenhaRequest;
import br.com.saudeplus.auth.dto.RedefinirSenhaRequest;
import br.com.saudeplus.auth.dto.UsuarioResponse;
import br.com.saudeplus.config.SaudePlusProperties;
import br.com.saudeplus.exception.ApiException;
import br.com.saudeplus.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	static final String MSG_CREDENCIAIS = "Dados incorretos. Confira o e-mail e a senha.";
	static final String MSG_RECUPERACAO =
			"Se existir uma conta com este e-mail, enviamos as instruções de recuperação.";
	private static final int LIMITE_BYTES_BCRYPT = 72;

	private final UsuarioRepository usuarios;
	private final TokenRedefinicaoSenhaRepository tokens;
	private final PasswordEncoder encoder;
	private final JwtService jwt;
	private final EnviadorDeEmail email;
	private final SaudePlusProperties propriedades;
	private final SecureRandom aleatorio = new SecureRandom();

	/** Hash de uma senha qualquer, usado para gastar o mesmo tempo quando o e-mail nao existe. */
	private final String hashFalso;

	public AuthService(UsuarioRepository usuarios, TokenRedefinicaoSenhaRepository tokens,
			PasswordEncoder encoder, JwtService jwt, EnviadorDeEmail email,
			SaudePlusProperties propriedades) {
		this.usuarios = usuarios;
		this.tokens = tokens;
		this.encoder = encoder;
		this.jwt = jwt;
		this.email = email;
		this.propriedades = propriedades;
		this.hashFalso = encoder.encode("senha-que-ninguem-usa");
	}

	/** Cadastro publico: o perfil e sempre PACIENTE, nao importa o que o cliente envie. */
	@Transactional
	public AuthResponse cadastrar(CadastroRequest req) {
		exigirSenhaCabeNoBcrypt(req.senha());

		String emailNormalizado = normalizar(req.email());
		if (usuarios.existsByEmail(emailNormalizado)) {
			throw emailJaCadastrado();
		}

		String telefone = req.telefone() == null || req.telefone().isBlank() ? null : req.telefone().trim();
		Usuario novo = new Usuario(req.nomeCompleto().trim(), emailNormalizado,
				encoder.encode(req.senha()), telefone, Role.PACIENTE);
		try {
			usuarios.saveAndFlush(novo);
		} catch (DataIntegrityViolationException e) {
			// duas requisicoes simultaneas com o mesmo e-mail: a restricao unica do banco decide
			throw emailJaCadastrado();
		}
		return resposta(novo);
	}

	/** Login de qualquer perfil. Nao diferencia e-mail inexistente de senha errada, nem no tempo. */
	@Transactional(readOnly = true)
	public AuthResponse autenticar(LoginRequest req) {
		Usuario usuario = usuarios.findByEmail(normalizar(req.email())).orElse(null);
		String hash = usuario != null ? usuario.getSenhaHash() : hashFalso;

		boolean cabe = req.senha().getBytes(StandardCharsets.UTF_8).length <= LIMITE_BYTES_BCRYPT;
		boolean senhaCorreta = encoder.matches(cabe ? req.senha() : "x", hash) && cabe;

		if (usuario == null || !senhaCorreta) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "Não autorizado", MSG_CREDENCIAIS);
		}
		if (!usuario.isAtivo()) {
			throw new ApiException(HttpStatus.FORBIDDEN, "Conta desativada",
					"Esta conta está desativada. Entre em contato com a administração.");
		}
		return resposta(usuario);
	}

	/** Sempre responde a mesma coisa, exista ou nao a conta. */
	@Transactional
	public String solicitarRecuperacao(RecuperarSenhaRequest req) {
		usuarios.findByEmail(normalizar(req.email())).filter(Usuario::isAtivo).ifPresent(usuario -> {
			Instant agora = Instant.now();

			// um token novo invalida os anteriores
			tokens.findByUsuarioIdAndUsadoEmIsNull(usuario.getId()).forEach(t -> t.consumir(agora));

			byte[] bruto = new byte[32];
			aleatorio.nextBytes(bruto);
			String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bruto);

			Instant expira = agora.plus(Duration.ofMinutes(propriedades.recuperacao().validadeMinutos()));
			tokens.save(new TokenRedefinicaoSenha(usuario, sha256(token), expira));

			String link = propriedades.front().url() + "/redefinir-senha?token=" + token;
			email.enviarLinkDeRecuperacao(usuario.getEmail(), usuario.getNomeCompleto(), link);
		});
		return MSG_RECUPERACAO;
	}

	@Transactional
	public String redefinirSenha(RedefinirSenhaRequest req) {
		exigirSenhaCabeNoBcrypt(req.senha());

		Instant agora = Instant.now();
		TokenRedefinicaoSenha token = tokens.findByTokenHash(sha256(req.token().trim()))
				.filter(t -> t.estaValido(agora))
				.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Link inválido",
						"Este link de recuperação é inválido ou expirou. Peça um novo."));

		Usuario usuario = token.getUsuario();
		if (!usuario.isAtivo()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Link inválido",
					"Este link de recuperação é inválido ou expirou. Peça um novo.");
		}

		usuario.setSenhaHash(encoder.encode(req.senha()));
		token.consumir(agora);
		tokens.findByUsuarioIdAndUsadoEmIsNull(usuario.getId()).forEach(t -> t.consumir(agora));
		return "Senha alterada com sucesso. Use a nova senha para entrar.";
	}

	@Transactional(readOnly = true)
	public UsuarioResponse perfil(long usuarioId) {
		Usuario usuario = usuarios.findById(usuarioId).filter(Usuario::isAtivo)
				.orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Não autenticado",
						"Sua sessão expirou ou é inválida. Faça login novamente."));
		return UsuarioResponse.de(usuario);
	}

	private AuthResponse resposta(Usuario usuario) {
		JwtService.TokenEmitido token = jwt.emitir(usuario);
		return AuthResponse.bearer(token.valor(), token.expiraEmSegundos(), UsuarioResponse.de(usuario));
	}

	private static ApiException emailJaCadastrado() {
		return new ApiException(HttpStatus.CONFLICT, "E-mail já cadastrado",
				"Já existe uma conta com este e-mail.", java.util.Map.of("email", "E-mail já cadastrado"));
	}

	/** BCrypt so considera os primeiros 72 bytes; com acentos, 72 caracteres podem passar disso. */
	private static void exigirSenhaCabeNoBcrypt(String senha) {
		if (senha.getBytes(StandardCharsets.UTF_8).length > LIMITE_BYTES_BCRYPT) {
			throw ApiException.validacao("senha", "A senha deve ter entre 8 e 72 caracteres");
		}
	}

	private static String normalizar(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}

	private static String sha256(String texto) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			return HexFormat.of().formatHex(digest.digest(texto.getBytes(StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException("SHA-256 indisponível", e);
		}
	}
}
