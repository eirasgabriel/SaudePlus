package br.com.saudeplus.notificacoes;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Categoria da notificação, usada pelo front-end para escolher ícone e cor. */
public enum TipoNotificacao {

    RESULTADO("resultado"),
    AGENDAMENTO("agendamento"),
    RETORNO("retorno");

    private final String chave;

    TipoNotificacao(String chave) {
        this.chave = chave;
    }

    @JsonValue
    public String chave() {
        return chave;
    }

    @JsonCreator
    public static TipoNotificacao porChave(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        for (TipoNotificacao tipo : values()) {
            if (tipo.chave.equalsIgnoreCase(valor) || tipo.name().equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de notificação desconhecido: " + valor);
    }
}
