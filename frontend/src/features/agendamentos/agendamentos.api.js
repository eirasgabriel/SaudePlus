import { apiFetch } from "../../services/api";

export async function listarAgendamentos() {
  return apiFetch("/agendamentos");
}

export async function buscarAgendamento(id) {
  return apiFetch(`/agendamentos/${id}`);
}

export async function criarAgendamento(payload) {
  return apiFetch("/agendamentos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function atualizarAgendamento(id, payload) {
  return apiFetch(`/agendamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function atualizarStatusAgendamento(id, status) {
  return apiFetch(`/agendamentos/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function excluirAgendamento(id) {
  return apiFetch(`/agendamentos/${id}`, {
    method: "DELETE",
  });
}
