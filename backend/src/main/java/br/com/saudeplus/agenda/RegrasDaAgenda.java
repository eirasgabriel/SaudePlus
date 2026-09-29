package br.com.saudeplus.agenda;

import java.time.Duration;

import org.springframework.stereotype.Component;

import br.com.saudeplus.configuracoes.ConfiguracoesService;
import tools.jackson.databind.JsonNode;

/**
 * Regras de agenda em vigor: o que a administração gravou no grupo
 * `agendamento` das configurações e, para o que não foi gravado, os padrões de
 * `saudeplus.agenda.*`. Lido a cada uso (uma busca por chave primária), então
 * uma mudança na tela de configurações vale na próxima requisição.
 */
@Component
public class RegrasDaAgenda {

    private final ConfiguracoesService configuracoes;
    private final AgendaPropriedades padroes;

    public RegrasDaAgenda(ConfiguracoesService configuracoes, AgendaPropriedades padroes) {
        this.configuracoes = configuracoes;
        this.padroes = padroes;
    }

    public Regras atuais() {
        JsonNode grupo = configuracoes.grupo(ConfiguracoesService.AGENDAMENTO);
        return new Regras(
                horas(grupo, "antecedenciaMinimaHoras", padroes.antecedenciaMinima()),
                grupo.hasNonNull("janelaAgendamentoDias") ? grupo.get("janelaAgendamentoDias").asInt()
                        : padroes.janelaMaximaDias(),
                horas(grupo, "antecedenciaCancelamentoHoras", padroes.antecedenciaCancelamento()));
    }

    private static Duration horas(JsonNode grupo, String campo, Duration padrao) {
        return grupo.hasNonNull(campo) ? Duration.ofHours(grupo.get(campo).asInt()) : padrao;
    }

    /**
     * @param antecedenciaMinima horários que começam antes de "agora + isto" não são oferecidos
     * @param janelaMaximaDias até quantos dias à frente se reserva
     * @param antecedenciaCancelamento até quanto antes o paciente cancela ou remarca
     */
    public record Regras(Duration antecedenciaMinima, int janelaMaximaDias, Duration antecedenciaCancelamento) {
    }
}
