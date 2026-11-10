/* Operação de exames pela clínica (/api/admin/exames), papel ADMIN.
   Contrato em docs/api-exames.md. */

import { API_URL, ErroDeApi, http } from "../../services/http.js";
import { lerToken } from "../../services/sessaoStorage.js";

const autenticado = true;

/** Fila de exames, pedidos mais antigos primeiro. `status` opcional (ex.: "solicitado"). */
export function listarExames({ status, sinal } = {}) {
  return http.get("/api/admin/exames", { parametros: { status }, sinal, autenticado });
}

/** Marca a coleta. `dataHora` em horário local: "2026-10-05T07:30". */
export function agendarColeta(exameId, { dataHora, unidadeId }, { sinal } = {}) {
  return http.patch(`/api/admin/exames/${exameId}/agendamento`, { dataHora, unidadeId }, { sinal, autenticado });
}

export function iniciarAnalise(exameId, { sinal } = {}) {
  return http.patch(`/api/admin/exames/${exameId}/em-analise`, undefined, { sinal, autenticado });
}

export function cancelarExame(exameId, { sinal } = {}) {
  return http.patch(`/api/admin/exames/${exameId}/cancelar`, undefined, { sinal, autenticado });
}

/**
 * Anexa o resultado (PDF, PNG ou JPEG até 10 MB) e libera para o paciente.
 * Vai como multipart, então não usa o `http` (que envia JSON).
 */
export async function enviarResultado(exameId, arquivo) {
  const dados = new FormData();
  dados.append("arquivo", arquivo);
  const url = `${API_URL.replace(/\/$/, "")}/api/admin/exames/${exameId}/resultado`;
  const token = lerToken();
  let resposta;
  try {
    resposta = await fetch(url, {
      method: "POST",
      body: dados,
      headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
    });
  } catch {
    throw new ErroDeApi("Não foi possível falar com o servidor.", { status: 0, url });
  }
  const corpo = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new ErroDeApi(corpo?.mensagem ?? "Não foi possível enviar o resultado.", {
      status: resposta.status,
      corpo,
      url,
    });
  }
  return corpo;
}
