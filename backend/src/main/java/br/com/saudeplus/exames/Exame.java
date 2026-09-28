package br.com.saudeplus.exames;

/** Exame solicitado e ainda aguardando resultado. */
public record Exame(
        String id,
        String nome,
        String pacienteId,
        String medicoId,
        String prazo) {
}
