package br.com.saudeplus.agenda;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * `saudeplus.agenda.*`.
 *
 * @param antecedenciaMinima quanto antes do início um horário deixa de ser oferecido
 * @param janelaMaximaDias até quantos dias à frente se pode consultar e reservar
 * @param antecedenciaCancelamento até quanto antes do início o paciente pode cancelar ou remarcar
 */
@ConfigurationProperties("saudeplus.agenda")
public record AgendaPropriedades(Duration antecedenciaMinima, Integer janelaMaximaDias,
        Duration antecedenciaCancelamento) {

    public AgendaPropriedades {
        if (antecedenciaCancelamento == null) {
            antecedenciaCancelamento = Duration.ofHours(24);
        }
        if (antecedenciaMinima == null) {
            antecedenciaMinima = Duration.ofHours(2);
        }
        if (janelaMaximaDias == null) {
            janelaMaximaDias = 60;
        }
    }
}
