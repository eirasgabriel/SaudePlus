/* Chamadas da área do paciente (/api/paciente/*).
   O contrato está em docs/api-area-paciente.md; os DTOs ficam em
   backend/src/main/java/br/com/saudeplus/areapaciente/dto.
   O paciente vem do token: nenhuma rota recebe o id dele. */

import { baixarArquivo, http } from "../../services/http.js";

const autenticado = true;

/** Nome, próximas consultas, unidade da próxima consulta e avisos não lidos. */
export function buscarPainel({ sinal } = {}) {
  return http.get("/api/paciente/painel", { sinal, autenticado });
}

/** `situacao`: "futuras" ou "passadas" (sem ela, todas). */
export function listarConsultas({ situacao, status, sinal } = {}) {
  return http.get("/api/paciente/agendamentos", { parametros: { situacao, status }, sinal, autenticado });
}

/**
 * Reserva um horário livre. Horário tomado responde 409; especialidade que
 * o médico não atende, 422.
 */
export function reservarConsulta({ medicoId, especialidadeId, data, horario, modalidade, motivo }, { sinal } = {}) {
  return http.post(
    "/api/paciente/agendamentos",
    { medicoId, especialidadeId, data, horario, modalidade, motivo },
    { sinal, autenticado },
  );
}

/** Cancela; a menos de 24 h da consulta responde 422. */
export function cancelarConsulta(consultaId, { motivo, sinal } = {}) {
  return http.patch(`/api/paciente/agendamentos/${consultaId}/cancelar`, { motivo }, { sinal, autenticado });
}

/** Move para outro horário livre do mesmo médico; a consulta volta a "pendente". */
export function remarcarConsulta(consultaId, { data, horario, modalidade }, { sinal } = {}) {
  return http.patch(
    `/api/paciente/agendamentos/${consultaId}/remarcar`,
    { data, horario, modalidade },
    { sinal, autenticado },
  );
}

/** Consultas realizadas, com resumo, desfecho e a nota dada (ou null). */
export function buscarHistorico({ sinal } = {}) {
  return http.get("/api/paciente/historico", { sinal, autenticado });
}

export function avaliarConsulta({ agendamentoId, nota, comentario }, { sinal } = {}) {
  return http.post("/api/paciente/avaliacoes", { agendamentoId, nota, comentario }, { sinal, autenticado });
}

export function listarExames({ status, sinal } = {}) {
  return http.get("/api/paciente/exames", { parametros: { status }, sinal, autenticado });
}

/** Baixa o resultado de um exame liberado (PDF ou imagem). */
export function baixarResultadoDoExame(exameId, { sinal } = {}) {
  return baixarArquivo(`/api/paciente/exames/${exameId}/resultado`, { nomePadrao: "resultado-exame", sinal });
}

export function buscarNotificacoes({ sinal } = {}) {
  return http.get("/api/paciente/notificacoes", { sinal, autenticado });
}

export function marcarTodasComoLidas({ sinal } = {}) {
  return http.patch("/api/paciente/notificacoes/lidas", undefined, { sinal, autenticado });
}

/** Horários livres de um médico num dia (rota pública). */
export function buscarHorariosLivres(medicoId, data, { sinal } = {}) {
  return http.get(`/api/publico/profissionais/${medicoId}/horarios`, { parametros: { de: data, ate: data }, sinal });
}
