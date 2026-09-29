package br.com.saudeplus.auth;

import br.com.saudeplus.auth.dto.AuthResponse;
import br.com.saudeplus.auth.dto.CadastroRequest;
import br.com.saudeplus.auth.dto.LoginRequest;
import br.com.saudeplus.auth.dto.MensagemResponse;
import br.com.saudeplus.auth.dto.RecuperarSenhaRequest;
import br.com.saudeplus.auth.dto.RedefinirSenhaRequest;
import br.com.saudeplus.auth.dto.UsuarioResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Rotas de /api/auth/*. Contrato em docs/api.md. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService servico;

	public AuthController(AuthService servico) {
		this.servico = servico;
	}

	@PostMapping("/cadastro")
	public ResponseEntity<AuthResponse> cadastrar(@Valid @RequestBody CadastroRequest req) {
		return ResponseEntity.status(HttpStatus.CREATED).body(servico.cadastrar(req));
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest req) {
		return servico.autenticar(req);
	}

	@PostMapping("/recuperar-senha")
	public MensagemResponse recuperarSenha(@Valid @RequestBody RecuperarSenhaRequest req) {
		return new MensagemResponse(servico.solicitarRecuperacao(req));
	}

	@PostMapping("/redefinir-senha")
	public MensagemResponse redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest req) {
		return new MensagemResponse(servico.redefinirSenha(req));
	}

	@GetMapping("/perfil")
	public UsuarioResponse perfil(@AuthenticationPrincipal Jwt jwt) {
		return servico.perfil(Long.parseLong(jwt.getSubject()));
	}
}
