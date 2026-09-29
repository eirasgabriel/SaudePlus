package br.com.saudeplus.admin.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.StatusExame;

/**
 * Exame na fila da clínica.
 *
 * @param dataHora coleta marcada, em horário local da unidade (ou nula)
 */
public record ExameDaClinicaResposta(
        UUID id,
        String nome,
        String categoria,
        UUID pacienteId,
        String paciente,
        String medico,
        StatusExame status,
        LocalDateTime dataHora,
        String unidade,
        LocalDate prazo,
        Instant solicitadoEm,
        Instant resultadoLiberadoEm) {

    public static ExameDaClinicaResposta de(Exame exame, ZoneId fuso) {
        return new ExameDaClinicaResposta(
                exame.getId(),
                exame.getTipo().getNome(),
                exame.getTipo().getCategoria(),
                exame.getPaciente().getId(),
                exame.getPaciente().getUsuario().getNomeCompleto(),
                exame.getMedicoSolicitante() == null ? null : exame.getMedicoSolicitante().getUsuario().getNomeCompleto(),
                exame.getStatus(),
                exame.getDataHora() == null ? null : LocalDateTime.ofInstant(exame.getDataHora(), fuso),
                exame.getUnidade() == null ? null : exame.getUnidade().getNome(),
                exame.getPrazo(),
                exame.getCriadoEm(),
                exame.getResultadoLiberadoEm());
    }
}
