package br.com.saudeplus.security;

import br.com.saudeplus.config.SaudePlusProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/** Assinatura e validacao dos JWT (HS256) com o segredo configurado em saudeplus.jwt.secret. */
@Configuration
public class JwtConfig {

	private static final int TAMANHO_MINIMO_BYTES = 32;

	private final SecretKey chave;

	public JwtConfig(SaudePlusProperties propriedades) {
		byte[] bytes = propriedades.jwt().secret().getBytes(StandardCharsets.UTF_8);
		if (bytes.length < TAMANHO_MINIMO_BYTES) {
			throw new IllegalStateException(
					"saudeplus.jwt.secret (JWT_SECRET) precisa ter pelo menos 32 caracteres para HS256.");
		}
		this.chave = new SecretKeySpec(bytes, "HmacSHA256");
	}

	@Bean
	JwtEncoder jwtEncoder() {
		return new NimbusJwtEncoder(new ImmutableSecret<>(chave));
	}

	@Bean
	JwtDecoder jwtDecoder() {
		return NimbusJwtDecoder.withSecretKey(chave).macAlgorithm(MacAlgorithm.HS256).build();
	}
}
