package br.com.saudeplus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Liga os métodos `@Scheduled` (ex.: a retenção de dados, uma vez por dia). */
@Configuration
@EnableScheduling
public class TarefasAgendadasConfig {
}
