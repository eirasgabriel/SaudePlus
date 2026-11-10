package br.com.saudeplus.exames;

import java.util.EnumSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

public enum StatusExame implements EnumComChave {
    SOLICITADO("solicitado"),
    AGENDADO("agendado"),
    EM_ANALISE("em_analise"),
    LIBERADO("liberado"),
    CANCELADO("cancelado");

    private final String chave;

    StatusExame(String chave) {
        this.chave = chave;
    }

    /** Ainda sem resultado: aparece em "exames pendentes" do médico. */
    public static Set<StatusExame> pendentes() {
        return EnumSet.of(SOLICITADO, AGENDADO, EM_ANALISE);
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    /** Chave vinda de parâmetro de URL; vazio vira nulo (sem filtro). */
    public static StatusExame porChave(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        for (StatusExame status : values()) {
            if (status.chave.equalsIgnoreCase(valor)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status de exame desconhecido: " + valor);
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<StatusExame> {
        public Conversor() {
            super(StatusExame.class);
        }
    }
}
