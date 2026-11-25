import { http } from "../../services/http.js";

/* Rotas da conta da unidade clínica (/api/clinica). A unidade sempre vem da
   conta autenticada: nenhuma chamada envia o id dela. */

const autenticado = true;

export function buscarPainel({ sinal } = {}) {
  return http.get("/api/clinica/painel", { sinal, autenticado });
}

/** `status`: "confirmada", "aguardando" (chegada) ou "cancelada" (com `motivo` opcional). */
export function alterarStatusDoAgendamento(id, status, { motivo, sinal } = {}) {
  return http.patch(`/api/clinica/agendamentos/${id}/status`, { status, motivo }, { sinal, autenticado });
}

/** `{ telefone, horarioFuncionamento, email }`: o contato que a própria clínica mantém. */
export function alterarContato(dados, { sinal } = {}) {
  return http.put("/api/clinica/unidade", dados, { sinal, autenticado });
}

export function listarNotificacoes({ sinal } = {}) {
  return http.get("/api/clinica/notificacoes", { sinal, autenticado });
}

export function marcarNotificacaoComoLida(id, { sinal } = {}) {
  return http.patch(`/api/clinica/notificacoes/${id}/lida`, undefined, { sinal, autenticado });
}

export function marcarTodasComoLidas({ sinal } = {}) {
  return http.patch("/api/clinica/notificacoes/lidas", undefined, { sinal, autenticado });
}
