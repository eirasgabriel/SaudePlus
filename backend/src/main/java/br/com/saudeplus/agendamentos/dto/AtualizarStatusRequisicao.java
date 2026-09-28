package br.com.saudeplus.agendamentos.dto;

import br.com.saudeplus.agendamentos.StatusConsulta;
import jakarta.validation.constraints.NotNull;

/** Corpo do PATCH que muda o status de uma consulta. */
public record AtualizarStatusRequisicao(
        @NotNull(message = "Informe o novo status da consulta.") StatusConsulta status) {
}
