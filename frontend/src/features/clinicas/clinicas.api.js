import { apiFetch } from "../../services/api";

export async function listarClinicas() {
  return apiFetch("/clinicas");
}

export async function buscarClinica(id) {
  return apiFetch(`/clinicas/${id}`);
}

export async function criarClinica(payload) {
  return apiFetch("/clinicas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function atualizarClinica(id, payload) {
  return apiFetch(`/clinicas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function excluirClinica(id) {
  return apiFetch(`/clinicas/${id}`, {
    method: "DELETE",
  });
}
