import { apiFetch } from "../../services/api";

export async function listarUsuarios() {
  return apiFetch("/usuarios");
}

export async function buscarUsuario(id) {
  return apiFetch(`/usuarios/${id}`);
}

export async function criarUsuario(payload) {
  return apiFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function atualizarUsuario(id, payload) {
  return apiFetch(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function excluirUsuario(id) {
  return apiFetch(`/usuarios/${id}`, {
    method: "DELETE",
  });
}
