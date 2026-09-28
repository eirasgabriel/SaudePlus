import { apiFetch } from "../../services/api";

export async function getHealth() {
  return apiFetch("/health");
}

export async function login({ email, senha }) {
  return apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

/** Recupera o usuário autenticado salvo no navegador (ou null). */
export function obterUsuarioLogado() {
  try {
    const bruto = localStorage.getItem("saudeplus-user");
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

/** Limpa a sessão local. A navegação para /login fica a cargo de quem chama. */
export function logout() {
  localStorage.removeItem("saudeplus-token");
  localStorage.removeItem("saudeplus-user");
}
