package br.com.saudeplus.comum;

import java.util.Arrays;
import java.util.List;

/** Regras de exibição de nomes de pessoas, iguais às do front (`selectors.js`). */
public final class Nomes {

    private Nomes() {
    }

    /**
     * "Ana Paula Ferreira" → "AF": primeira e última palavra relevante.
     * Preposições curtas em minúsculas ("da", "de") não contam.
     */
    public static String iniciais(String nome) {
        if (nome == null || nome.isBlank()) {
            return "";
        }
        List<String> relevantes = Arrays.stream(nome.strip().split("\\s+"))
                .filter(parte -> parte.length() > 2 || Character.isUpperCase(parte.charAt(0)))
                .toList();
        if (relevantes.isEmpty()) {
            return "";
        }
        String primeira = relevantes.getFirst().substring(0, 1);
        String ultima = relevantes.size() > 1 ? relevantes.getLast().substring(0, 1) : "";
        return (primeira + ultima).toUpperCase();
    }
}
