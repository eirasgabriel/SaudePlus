package br.com.saudeplus.areamedico.dto;

import java.time.LocalDate;
import java.util.UUID;

import br.com.saudeplus.exames.StatusExame;

/**
 * Exame pedido pelo médico ainda sem resultado.
 *
 * @param prazo pronto para exibir: "Hoje", "Amanhã", "12/10" ou "Sem prazo"
 * @param prazoData a data exata, para ordenar ou destacar atrasos
 */
public record ExamePendenteResposta(UUID id, String nome, UUID pacienteId, String paciente, String prazo,
        LocalDate prazoData, StatusExame status) {
}
