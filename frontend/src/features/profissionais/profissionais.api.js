import { apiFetch } from "../../services/api";

export async function listarProfissionais() {
  return apiFetch("/profissionais");
}

export async function buscarProfissional(id) {
  return apiFetch(`/profissionais/${id}`);
}

export async function criarProfissional(payload) {
  return apiFetch("/profissionais", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function atualizarProfissional(id, payload) {
  return apiFetch(`/profissionais/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function excluirProfissional(id) {
  return apiFetch(`/profissionais/${id}`, {
    method: "DELETE",
  });
}
