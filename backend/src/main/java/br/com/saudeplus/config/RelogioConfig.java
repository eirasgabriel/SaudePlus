package br.com.saudeplus.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Relógio único da aplicação, no fuso de negócio (`saudeplus.fuso-horario`).
 *
 * Regras que dependem de "agora" (horários livres, antecedência de
 * cancelamento, expiração de token) recebem este `Clock` em vez de chamar
 * `now()` direto, para que os testes consigam fixar a data.
 */
@Configuration
public class RelogioConfig {

    @Bean
    Clock relogio(@Value("${saudeplus.fuso-horario:America/Sao_Paulo}") ZoneId fuso) {
        return Clock.system(fuso);
    }
}
