import { apiFetch } from "../../services/api";

export async function listarSuporte() {
  return apiFetch("/suporte");
}
