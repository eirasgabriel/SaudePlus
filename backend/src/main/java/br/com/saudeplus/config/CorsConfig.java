package br.com.saudeplus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Libera o servidor de desenvolvimento do Vite a chamar a API.
 *
 * As origens saem da propriedade `saudeplus.cors.origens`, com o padrão
 * apontando para as portas do Vite. Em produção, defina a variável de
 * ambiente correspondente — não há curinga aqui de propósito.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String[] origens;

    public CorsConfig(@Value("${saudeplus.cors.origens:http://localhost:5173,http://127.0.0.1:5173}") String[] origens) {
        this.origens = origens;
    }

    @Override
    public void addCorsMappings(CorsRegistry registro) {
        registro.addMapping("/api/**")
                .allowedOrigins(origens)
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
