package br.com.saudeplus.notificacoes;

import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/** Categoria da notificação; o front escolhe ícone e cor por ela. */
public enum TipoNotificacao implements EnumComChave {
    RESULTADO("resultado"),
    AGENDAMENTO("agendamento"),
    RETORNO("retorno"),
    CANCELAMENTO("cancelamento"),
    SISTEMA("sistema");

    private final String chave;

    TipoNotificacao(String chave) {
        this.chave = chave;
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<TipoNotificacao> {
        public Conversor() {
            super(TipoNotificacao.class);
        }
    }
}
