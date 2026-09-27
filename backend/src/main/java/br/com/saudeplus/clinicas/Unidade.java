package br.com.saudeplus.clinicas;

/** Unidade de atendimento (clínica, posto ou policlínica). */
public record Unidade(
        String id,
        String nome,
        String cidade,
        String endereco,
        String telefone,
        String horario,
        String mapUrl) {
}
