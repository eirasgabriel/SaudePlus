package br.com.saudeplus.agendamentos;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/** O que o agendamento reserva. "Retorno" é tipo, não status. */
public enum TipoAtendimento implements EnumComChave {
    CONSULTA("consulta", "Consulta"),
    RETORNO("retorno", "Retorno"),
    EXAME("exame", "Exame");

    private final String chave;
    private final String rotulo;

    TipoAtendimento(String chave, String rotulo) {
        this.chave = chave;
        this.rotulo = rotulo;
    }

    @Override
    @JsonValue
    public String chave() {
        return chave;
    }

    public String rotulo() {
        return rotulo;
    }

    @JsonCreator
    public static TipoAtendimento porChave(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        for (TipoAtendimento tipo : values()) {
            if (tipo.chave.equalsIgnoreCase(valor) || tipo.name().equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de atendimento desconhecido: " + valor);
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<TipoAtendimento> {
        public Conversor() {
            super(TipoAtendimento.class);
        }
    }
}
