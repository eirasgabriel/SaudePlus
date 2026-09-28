import { apiFetch } from "../../services/api";

export async function listarExames() {
  return apiFetch("/exames");
}

export async function buscarExame(id) {
  return apiFetch(`/exames/${id}`);
}

export async function criarExame(payload) {
  return apiFetch("/exames", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function atualizarExame(id, payload) {
  return apiFetch(`/exames/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function excluirExame(id) {
  return apiFetch(`/exames/${id}`, {
    method: "DELETE",
  });
}
