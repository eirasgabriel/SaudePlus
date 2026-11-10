package br.com.saudeplus.agendamentos;

import java.util.UUID;

/**
 * Publicado quando um agendamento é cancelado. Quem ouve age depois do
 * commit, então só reage a cancelamentos que de fato foram gravados.
 */
public record AgendamentoCancelado(UUID agendamentoId) {
}
