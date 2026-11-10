/* Chamadas públicas da busca de profissionais (sem login).
   Espelham br.com.saudeplus.publico.PublicoController. */

import { http } from "../../services/http.js";

/**
 * GET /api/publico/profissionais — busca paginada.
 * Listas (`especialidade`, `modalidade`, `convenio`) valem como "qualquer uma";
 * filtros diferentes se somam.
 */
export function buscarProfissionais(
  { q, especialidade, cidade, uf, modalidade, convenio, ordem, pagina, tamanho } = {},
  { sinal } = {},
) {
  return http.get("/api/publico/profissionais", {
    parametros: { q, especialidade, cidade, uf, modalidade, convenio, ordem, pagina, tamanho },
    sinal,
  });
}

/** GET /api/publico/profissionais/{id} — perfil completo. */
export function buscarProfissional(id, { sinal } = {}) {
  return http.get(`/api/publico/profissionais/${encodeURIComponent(id)}`, { sinal });
}

/** Horários livres (`[{ data, horario, duracaoMin, unidadeId, modalidade }]`). Sem datas: duas semanas. */
export function listarHorarios(id, { de, ate } = {}, { sinal } = {}) {
  return http.get(`/api/publico/profissionais/${encodeURIComponent(id)}/horarios`, { parametros: { de, ate }, sinal });
}

/** Avaliações, mais recentes primeiro (`Pagina<{ nota, comentario, autor, data }>`). */
export function listarAvaliacoes(id, { pagina, tamanho } = {}, { sinal } = {}) {
  return http.get(`/api/publico/profissionais/${encodeURIComponent(id)}/avaliacoes`, { parametros: { pagina, tamanho }, sinal });
}

/** Cidades com unidade em funcionamento: `[{ nome, uf, rotulo: "São Paulo - SP" }]`. */
export function listarCidades({ sinal } = {}) {
  return http.get("/api/publico/cidades", { sinal });
}

export function listarConvenios({ sinal } = {}) {
  return http.get("/api/publico/convenios", { sinal });
}

export function listarEspecialidades({ sinal } = {}) {
  return http.get("/api/publico/especialidades", { sinal });
}
