package br.com.saudeplus.agendamentos;

import java.util.UUID;

/** A consulta foi confirmada (pelo médico ou pela recepção). Gera a cobrança, depois do commit. */
public record AgendamentoConfirmado(UUID agendamentoId) {
}
