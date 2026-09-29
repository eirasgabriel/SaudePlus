package br.com.saudeplus.security;

import br.com.saudeplus.auth.Usuario;
import br.com.saudeplus.config.SaudePlusProperties;
import java.time.Duration;
import java.time.Instant;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/**
 * Emite o JWT de acesso. Claims: sub (id), email, role, nome, iat, exp.
 * Nada sensivel entra no token: JWT e assinado, nao criptografado.
 */
@Service
public class JwtService {

	private final JwtEncoder encoder;
	private final Duration validade;

	public JwtService(JwtEncoder encoder, SaudePlusProperties propriedades) {
		this.encoder = encoder;
		this.validade = Duration.ofHours(propriedades.jwt().expiracaoHoras());
	}

	public TokenEmitido emitir(Usuario usuario) {
		Instant agora = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.subject(String.valueOf(usuario.getId()))
				.claim("email", usuario.getEmail())
				.claim("role", usuario.getRole().name())
				.claim("nome", usuario.getNomeCompleto())
				.issuedAt(agora)
				.expiresAt(agora.plus(validade))
				.build();
		JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
		String token = encoder.encode(JwtEncoderParameters.from(cabecalho, claims)).getTokenValue();
		return new TokenEmitido(token, validade.toSeconds());
	}

	public record TokenEmitido(String valor, long expiraEmSegundos) {
	}
}
