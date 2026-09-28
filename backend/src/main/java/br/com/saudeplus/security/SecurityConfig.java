package br.com.saudeplus.security;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

/**
 * API stateless: sem sessão, sem cookie, sem CSRF. Cada requisição protegida
 * traz `Authorization: Bearer <jwt>`, validado aqui com o mesmo segredo que
 * o {@link JwtService} usa para assinar.
 *
 * As regras por prefixo seguem `docs/api.md`. As proteções de rota do React
 * são só navegação; a autorização que vale é esta.
 */
@Configuration
public class SecurityConfig {

    private static final String[] AUTH_PUBLICO = {
        "/api/auth/login", "/api/auth/cadastro", "/api/auth/recuperar-senha", "/api/auth/redefinir-senha",
    };

    /**
     * Rotas do painel do médico criadas antes da autenticação, com o id do
     * médico no caminho. Migram para `/api/medico/**` (id vindo do token) na
     * fase de agendamentos; até lá, ficam restritas ao papel MEDICO.
     */
    private static final String[] PAINEL_MEDICO_LEGADO = {
        "/api/medicos/**", "/api/agendamentos/**", "/api/pacientes/**", "/api/clinicas/**",
    };

    private static final String[] DOCUMENTACAO = {
        "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
    };

    @Bean
    SecurityFilterChain cadeiaDeSeguranca(HttpSecurity http, ConversorDeJwt conversor, RespostasDeSeguranca respostas)
            throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(rotas -> rotas
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, AUTH_PUBLICO).permitAll()
                        .requestMatchers("/api/publico/**").permitAll()
                        // Só respondem no perfil dev; nos demais, o springdoc está desligado.
                        .requestMatchers(DOCUMENTACAO).permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/medico/**").hasRole("MEDICO")
                        .requestMatchers("/api/paciente/**").hasRole("PACIENTE")
                        .requestMatchers(PAINEL_MEDICO_LEGADO).hasRole("MEDICO")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(servidor -> servidor
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(conversor))
                        .authenticationEntryPoint(respostas)
                        .accessDeniedHandler(respostas))
                .exceptionHandling(excecoes -> excecoes
                        .authenticationEntryPoint(respostas)
                        .accessDeniedHandler(respostas));
        return http.build();
    }

    @Bean
    JwtDecoder decodificadorJwt(JwtPropriedades propriedades) {
        SecretKeySpec chave = new SecretKeySpec(propriedades.segredoEmBytes(), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(chave).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    JwtEncoder codificadorJwt(JwtPropriedades propriedades) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(propriedades.segredoEmBytes()));
    }

    @Bean
    PasswordEncoder codificadorDeSenha() {
        return new BCryptPasswordEncoder();
    }
}
