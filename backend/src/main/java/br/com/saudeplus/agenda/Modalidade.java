package br.com.saudeplus.agenda;

import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/** Forma de atendimento. As chaves são as mesmas dos filtros da busca no front. */
public enum Modalidade implements EnumComChave {
    PRESENCIAL("presencial"),
    ONLINE("online"),
    DOMICILIAR("domiciliar");

    private final String chave;

    Modalidade(String chave) {
        this.chave = chave;
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    /** Aceita a chave (`online`) vinda de parâmetro de URL. */
    public static Modalidade porChave(String chave) {
        for (Modalidade modalidade : values()) {
            if (modalidade.chave.equalsIgnoreCase(chave)) {
                return modalidade;
            }
        }
        throw new IllegalArgumentException("Modalidade desconhecida: " + chave);
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<Modalidade> {
        public Conversor() {
            super(Modalidade.class);
        }
    }
}
