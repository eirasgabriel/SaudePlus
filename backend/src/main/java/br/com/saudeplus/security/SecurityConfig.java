package br.com.saudeplus.security;

import br.com.saudeplus.config.SaudePlusProperties;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * API stateless: sem sessao e sem cookie, so JWT no cabecalho Authorization.
 * Como nao ha cookie de sessao, CSRF nao se aplica e fica desligado.
 *
 * A autorizacao por perfil e feita aqui, por prefixo de rota. E ela que vale;
 * as protecoes de rota do React sao so conveniencia de navegacao.
 */
@Configuration
public class SecurityConfig {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	SecurityFilterChain filtros(HttpSecurity http) throws Exception {
		AuthenticationEntryPoint naoAutenticado = (req, res, ex) -> RespostaDeErroSeguranca.escrever(res, 401,
				"Não autenticado", "Sua sessão expirou ou é inválida. Faça login novamente.");
		AccessDeniedHandler semPermissao = (req, res, ex) -> RespostaDeErroSeguranca.escrever(res, 403,
				"Acesso negado", "Você não tem permissão para acessar este recurso.");

		http
				.csrf(AbstractHttpConfigurer::disable)
				.cors(Customizer.withDefaults())
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(a -> a
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.POST,
								"/api/auth/login",
								"/api/auth/cadastro",
								"/api/auth/recuperar-senha",
								"/api/auth/redefinir-senha").permitAll()
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/medico/**").hasRole("MEDICO")
						.requestMatchers("/api/paciente/**").hasRole("PACIENTE")
						.anyRequest().authenticated())
				.exceptionHandling(e -> e
						.authenticationEntryPoint(naoAutenticado)
						.accessDeniedHandler(semPermissao))
				.oauth2ResourceServer(o -> o
						.jwt(j -> j.jwtAuthenticationConverter(conversorDeJwt()))
						.authenticationEntryPoint(naoAutenticado)
						.accessDeniedHandler(semPermissao));

		return http.build();
	}

	/** Transforma a claim "role" (ex.: ADMIN) na authority ROLE_ADMIN. */
	private JwtAuthenticationConverter conversorDeJwt() {
		JwtGrantedAuthoritiesConverter autoridades = new JwtGrantedAuthoritiesConverter();
		autoridades.setAuthoritiesClaimName("role");
		autoridades.setAuthorityPrefix("ROLE_");
		JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
		conversor.setJwtGrantedAuthoritiesConverter(autoridades);
		return conversor;
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(SaudePlusProperties propriedades) {
		List<String> origens = Arrays.stream(propriedades.cors().origens().split(","))
				.map(String::trim)
				.filter(o -> !o.isEmpty())
				.toList();

		CorsConfiguration cors = new CorsConfiguration();
		cors.setAllowedOrigins(origens);
		cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
		cors.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
		fonte.registerCorsConfiguration("/api/**", cors);
		return fonte;
	}
}
