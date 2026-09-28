import { apiFetch } from "../../services/api";

export async function listarConfiguracoes() {
  return apiFetch("/configuracoes");
}
