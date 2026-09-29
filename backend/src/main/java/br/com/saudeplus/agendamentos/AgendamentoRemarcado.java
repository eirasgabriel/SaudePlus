package br.com.saudeplus.agendamentos;

import java.time.LocalDateTime;
import java.util.UUID;

/** Paciente mudou a consulta de horário. `inicioAnterior` é o horário antigo, local. */
public record AgendamentoRemarcado(UUID agendamentoId, LocalDateTime inicioAnterior) {
}
