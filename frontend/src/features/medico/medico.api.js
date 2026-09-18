/* Chamadas do painel do médico.
   O contrato está em docs/api-painel-medico.md; os DTOs correspondentes
   ficam nos pacotes `dto` sob backend/src/main/java/br/com/saudeplus. */

import { http } from "../../services/http.js";

/** Médico fixo enquanto não há autenticação — vem do token depois. */
export const MEDICO_PADRAO = "med-1";

/**
 * Tudo o que a tela precisa, numa requisição só.
 * `data` opcional no formato ISO (2026-09-15).
 */
export function buscarPainel(medicoId = MEDICO_PADRAO, { data, sinal } = {}) {
  return http.get(`/api/medicos/${medicoId}/painel`, { parametros: { data }, sinal });
}

/** Agenda do dia. `status` aceita as chaves do domínio, ou "todas". */
export function buscarAgenda(medicoId = MEDICO_PADRAO, { data, status, sinal } = {}) {
  return http.get(`/api/medicos/${medicoId}/agenda`, { parametros: { data, status }, sinal });
}

export function buscarPacientes(medicoId = MEDICO_PADRAO, { limite, sinal } = {}) {
  return http.get(`/api/medicos/${medicoId}/pacientes`, { parametros: { limite }, sinal });
}

export function buscarExamesPendentes(medicoId = MEDICO_PADRAO, { sinal } = {}) {
  return http.get(`/api/medicos/${medicoId}/exames-pendentes`, { sinal });
}

export function buscarNotificacoes(medicoId = MEDICO_PADRAO, { sinal } = {}) {
  return http.get(`/api/medicos/${medicoId}/notificacoes`, { sinal });
}

/** Move a consulta para outro status e devolve a consulta atualizada. */
export function atualizarStatusDaConsulta(consultaId, status, { sinal } = {}) {
  return http.patch(`/api/agendamentos/${consultaId}/status`, { status }, { sinal });
}
