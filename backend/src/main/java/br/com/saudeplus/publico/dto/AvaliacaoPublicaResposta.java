package br.com.saudeplus.publico.dto;

import java.time.LocalDate;

/**
 * Avaliação exibida no perfil público. O autor vem abreviado ("Maria S."):
 * o nome completo do paciente não é exposto.
 */
public record AvaliacaoPublicaResposta(int nota, String comentario, String autor, LocalDate data) {

    /** "Maria da Silva Souza" → "Maria S.". */
    public static String abreviar(String nome) {
        String[] partes = nome.strip().split("\\s+");
        if (partes.length == 1) {
            return partes[0];
        }
        return partes[0] + " " + partes[partes.length - 1].charAt(0) + ".";
    }
}
