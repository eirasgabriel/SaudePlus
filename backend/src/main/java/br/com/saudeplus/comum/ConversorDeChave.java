package br.com.saudeplus.comum;

import java.util.Arrays;

import jakarta.persistence.AttributeConverter;

/**
 * Grava um {@link EnumComChave} pela chave. Cada enum ganha uma subclasse
 * curta anotada com `@Converter(autoApply = true)`.
 */
public abstract class ConversorDeChave<E extends Enum<E> & EnumComChave> implements AttributeConverter<E, String> {

    private final Class<E> tipo;

    protected ConversorDeChave(Class<E> tipo) {
        this.tipo = tipo;
    }

    @Override
    public String convertToDatabaseColumn(E valor) {
        return valor == null ? null : valor.chave();
    }

    @Override
    public E convertToEntityAttribute(String chave) {
        if (chave == null) {
            return null;
        }
        return Arrays.stream(tipo.getEnumConstants())
                .filter(valor -> valor.chave().equals(chave))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Valor desconhecido para %s no banco: %s"
                        .formatted(tipo.getSimpleName(), chave)));
    }
}
