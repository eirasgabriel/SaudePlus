package br.com.saudeplus.usuarios;

import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/**
 * Situação da conta. Só `ativo` entra no sistema.
 *
 * `excluido` é o fim da linha: a conta some da administração e não volta, mas a
 * linha e o histórico ficam guardados (LGPD art. 16, I; prontuário por 20 anos,
 * CFM 1.821/2007). Só se chega a ele a partir de `inativo`.
 */
public enum StatusConta implements EnumComChave {
    ATIVO("ativo"),
    BLOQUEADO("bloqueado"),
    INATIVO("inativo"),
    EXCLUIDO("excluido");

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
