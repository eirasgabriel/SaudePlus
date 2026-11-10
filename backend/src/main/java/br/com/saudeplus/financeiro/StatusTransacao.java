package br.com.saudeplus.financeiro;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import br.com.saudeplus.comum.ConversorDeChave;
import br.com.saudeplus.comum.EnumComChave;
import jakarta.persistence.Converter;

/**
 * `pendente` → `pago` ou `estornado` (cobrança anulada antes do pagamento);
 * `pago` → `estornado` (devolução). Estornado é final.
 */
public enum StatusTransacao implements EnumComChave {
    PENDENTE("pendente", "Pendente"),
    PAGO("pago", "Pago"),
    ESTORNADO("estornado", "Estornado");

    private final String chave;
    private final String rotulo;

    StatusTransacao(String chave, String rotulo) {
        this.chave = chave;
        this.rotulo = rotulo;
    }

    public boolean podeIrPara(StatusTransacao novo) {
        return switch (this) {
            case PENDENTE -> novo == PAGO || novo == ESTORNADO;
            case PAGO -> novo == ESTORNADO;
            case ESTORNADO -> false;
        };
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
    public static StatusTransacao porChave(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        for (StatusTransacao status : values()) {
            if (status.chave.equalsIgnoreCase(valor) || status.name().equalsIgnoreCase(valor)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status de transação desconhecido: " + valor);
    }

    @Converter(autoApply = true)
    public static class Conversor extends ConversorDeChave<StatusTransacao> {
        public Conversor() {
            super(StatusTransacao.class);
        }
    }
}
