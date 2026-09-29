package br.com.saudeplus.clinicas;

import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/** Só unidade `ativa` aparece na busca pública e recebe agendamentos. */
public enum StatusUnidade implements EnumComChave {
    ATIVA("ativa"),
    MANUTENCAO("manutencao"),
    INATIVA("inativa");

    private final String chave;

    StatusUnidade(String chave) {
        this.chave = chave;
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<StatusUnidade> {
        public Conversor() {
            super(StatusUnidade.class);
        }
    }
}
