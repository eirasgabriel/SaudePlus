package br.com.saudeplus.agendamentos;

import java.util.UUID;

/** Paciente reservou um horário. Tratado depois do commit. */
public record AgendamentoCriado(UUID agendamentoId) {
}
