/* Chamadas da área do médico (/api/medico/*).
   O contrato está em docs/api.md; os DTOs ficam em
   backend/src/main/java/br/com/saudeplus/areamedico/dto.
   O médico vem do token: nenhuma rota recebe o id dele. */

import { baixarArquivo, http } from "../../services/http.js";

const autenticado = true;

/**
 * Tudo o que a tela inicial precisa, numa requisição só.
 * `data` opcional no formato ISO (2026-09-15); sem ela, o servidor usa hoje.
 */
export function buscarPainel({ data, sinal } = {}) {
  return http.get("/api/medico/painel", { parametros: { data }, sinal, autenticado });
}

/** Agenda do dia. `status` aceita a chave de um status, ou "todas". */
export function buscarAgenda({ data, status, sinal } = {}) {
  return http.get("/api/medico/agenda", { parametros: { data, status }, sinal, autenticado });
}

/** Pacientes com consulta com este médico, paginados; `q` filtra pelo nome. */
export function buscarPacientes({ q, pagina, tamanho, sinal } = {}) {
  return http.get("/api/medico/pacientes", { parametros: { q, pagina, tamanho }, sinal, autenticado });
}

/** Ficha do paciente: histórico e exames com este médico. */
export function buscarPaciente(pacienteId, { sinal } = {}) {
  return http.get(`/api/medico/pacientes/${pacienteId}`, { sinal, autenticado });
}

export function buscarExamesPendentes({ sinal } = {}) {
  return http.get("/api/medico/exames-pendentes", { sinal, autenticado });
}

/**
 * Pede um exame para um paciente seu (com consulta com você).
 * `prazo` (data ISO) e `agendamentoOrigemId` são opcionais.
 */
export function solicitarExame({ pacienteId, tipoExameId, prazo, agendamentoOrigemId }, { sinal } = {}) {
  return http.post("/api/medico/exames", { pacienteId, tipoExameId, prazo, agendamentoOrigemId }, { sinal, autenticado });
}

/** Baixa o resultado de um exame que você pediu. */
export function baixarResultadoDoExame(exameId, { sinal } = {}) {
  return baixarArquivo(`/api/medico/exames/${exameId}/resultado`, { nomePadrao: "resultado-exame", sinal });
}

/** Catálogo de exames com o preparo de cada um (rota pública). */
export function listarTiposDeExame({ sinal } = {}) {
  return http.get("/api/publico/tipos-exame", { sinal });
}

export function buscarNotificacoes({ sinal } = {}) {
  return http.get("/api/medico/notificacoes", { sinal, autenticado });
}

export function marcarNotificacaoComoLida(notificacaoId, { sinal } = {}) {
  return http.patch(`/api/medico/notificacoes/${notificacaoId}/lida`, undefined, { sinal, autenticado });
}

/**
 * Move a consulta para outro status e devolve a consulta atualizada.
 * Transição não permitida responde 422; `motivo` vale para "cancelada".
 */
export function atualizarStatusDaConsulta(consultaId, status, { motivo, sinal } = {}) {
  return http.patch(`/api/medico/agendamentos/${consultaId}/status`, { status, motivo }, { sinal, autenticado });
}

/** Registra resumo e desfecho; a consulta em andamento passa a "realizada". */
export function registrarAtendimento(consultaId, { resumo, desfecho }, { sinal } = {}) {
  return http.patch(`/api/medico/agendamentos/${consultaId}/atendimento`, { resumo, desfecho }, { sinal, autenticado });
}

/* Janelas semanais: { unidadeId, diaSemana (1 = segunda), inicio "HH:mm", fim, duracaoMin, modalidade } */

export function listarDisponibilidades({ sinal } = {}) {
  return http.get("/api/medico/disponibilidades", { sinal, autenticado });
}

export function criarDisponibilidade(janela, { sinal } = {}) {
  return http.post("/api/medico/disponibilidades", janela, { sinal, autenticado });
}

export function alterarDisponibilidade(id, janela, { sinal } = {}) {
  return http.put(`/api/medico/disponibilidades/${id}`, janela, { sinal, autenticado });
}

export function removerDisponibilidade(id, { sinal } = {}) {
  return http.remover(`/api/medico/disponibilidades/${id}`, { sinal, autenticado });
}

/* Bloqueios: { inicio: "2026-10-01T08:00", fim, motivo }, em horário local. */

export function listarBloqueios({ sinal } = {}) {
  return http.get("/api/medico/bloqueios", { sinal, autenticado });
}

/** Com consultas marcadas no período, responde 422 até vir `cancelarAgendamentos: true`. */
export function criarBloqueio(bloqueio, { cancelarAgendamentos = false, sinal } = {}) {
  return http.post("/api/medico/bloqueios", bloqueio, {
    parametros: { cancelarAgendamentos: cancelarAgendamentos || undefined },
    sinal,
    autenticado,
  });
}

export function removerBloqueio(id, { sinal } = {}) {
  return http.remover(`/api/medico/bloqueios/${id}`, { sinal, autenticado });
}
