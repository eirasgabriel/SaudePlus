package br.com.saudeplus.financeiro;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

public enum FormaPagamento implements EnumComChave {
    CREDITO("credito", "Cartão de crédito"),
    DEBITO("debito", "Cartão de débito"),
    PIX("pix", "Pix"),
    BOLETO("boleto", "Boleto"),
    DINHEIRO("dinheiro", "Dinheiro"),
    CONVENIO("convenio", "Convênio");

    private final String chave;
    private final String rotulo;

    FormaPagamento(String chave, String rotulo) {
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
    public static FormaPagamento porChave(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        for (FormaPagamento forma : values()) {
            if (forma.chave.equalsIgnoreCase(valor) || forma.name().equalsIgnoreCase(valor)) {
                return forma;
            }
        }
        throw new IllegalArgumentException("Forma de pagamento desconhecida: " + valor);
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<FormaPagamento> {
        public Conversor() {
            super(FormaPagamento.class);
        }
    }
}
