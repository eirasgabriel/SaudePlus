package br.com.saudeplus.exames.dto;

import br.com.saudeplus.exames.Exame;

public record ExameResposta(
        String id,
        String nome,
        String pacienteId,
        String paciente,
        String prazo) {

    public static ExameResposta de(Exame exame, String nomeDoPaciente) {
        return new ExameResposta(exame.id(), exame.nome(), exame.pacienteId(), nomeDoPaciente, exame.prazo());
    }
}
