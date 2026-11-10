package br.com.saudeplus.financeiro;

import com.fasterxml.jackson.annotation.JsonValue;
import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/**
 * De onde veio a cobrança. Só a de `CONSULTA` é única por agendamento (índice
 * `uk_transacoes_cobranca_da_consulta`): lançamentos manuais ligados à mesma
 * consulta (taxa, exame particular) continuam permitidos.
 */
public enum OrigemTransacao implements EnumComChave {
    /** Gerada ao confirmar a consulta ({@link CobrancaDeConsultas}). */
    CONSULTA("consulta"),
    /** Lançada pela administração. */
    MANUAL("manual");

    private final String chave;

    OrigemTransacao(String chave) {
        this.chave = chave;
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<OrigemTransacao> {
        public Conversor() {
            super(OrigemTransacao.class);
        }
    }
}
