package br.com.saudeplus.usuarios;

import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/** Situação da conta. Só `ativo` entra no sistema. */
public enum StatusConta implements EnumComChave {
    ATIVO("ativo"),
    BLOQUEADO("bloqueado"),
    INATIVO("inativo");

    private final String chave;

    StatusConta(String chave) {
        this.chave = chave;
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<StatusConta> {
        public Conversor() {
            super(StatusConta.class);
        }
    }
}
