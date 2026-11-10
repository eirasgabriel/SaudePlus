package br.com.saudeplus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

/**
 * Metadados da documentação gerada em `/swagger-ui.html`. A interface só é
 * ligada no perfil dev (ver `application.yml`).
 */
@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI documentacaoDaApi() {
        return new OpenAPI().info(new Info()
                .title("SaudePlus API")
                .description("Agendamento de consultas e exames: pacientes, médicos e administração.")
                .version("v1"));
    }
}
