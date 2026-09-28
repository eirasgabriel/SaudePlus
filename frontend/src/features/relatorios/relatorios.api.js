import { apiFetch } from "../../services/api";

export async function listarRelatorios() {
  return apiFetch("/relatorios");
}
