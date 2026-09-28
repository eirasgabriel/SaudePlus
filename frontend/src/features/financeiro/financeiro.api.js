import { apiFetch } from "../../services/api";

export async function listarFinanceiro() {
  return apiFetch("/financeiro");
}
