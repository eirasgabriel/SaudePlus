/* Chamadas da área administrativa (/api/admin/*).
   Contrato em docs/api-admin.md. ADMIN acessa tudo; a equipe (gestor,
   recepção...) só os módulos liberados na matriz de permissões. */

import { baixarArquivo, http } from "../../services/http.js";

const autenticado = true;

/* ------------------------------------------------------------ geral */

/** Módulos que quem está logado pode abrir (ids do menu: "dashboard", "usuarios"...). */
export function buscarModulos({ sinal } = {}) {
  return http.get("/api/auth/modulos", { sinal, autenticado });
}

export function buscarDashboard({ meses = 9, sinal } = {}) {
  return http.get("/api/admin/dashboard", { parametros: { meses }, sinal, autenticado });
}

/* ------------------------------------------------------------ usuários */

/** Até 500 por página: as tabelas do admin filtram e paginam no navegador. */
export function listarUsuarios({ q, papel, status, pagina = 0, tamanho = 500, sinal } = {}) {
  return http.get("/api/admin/usuarios", { parametros: { q, papel, status, pagina, tamanho }, sinal, autenticado });
}

export function buscarMetricasDeUsuarios({ sinal } = {}) {
  return http.get("/api/admin/usuarios/metricas", { sinal, autenticado });
}

/**
 * Cria a conta e envia o convite por e-mail. Para MEDICO, `medico` traz
 * { crm, crmUf, especialidadeIds, unidadeIds, valorConsulta, bio }.
 */
export function criarUsuario(dados, { sinal } = {}) {
  return http.post("/api/admin/usuarios", dados, { sinal, autenticado });
}

export function alterarUsuario(id, dados, { sinal } = {}) {
  return http.put(`/api/admin/usuarios/${id}`, dados, { sinal, autenticado });
}

/** `status`: "ativo" | "bloqueado" | "inativo". */
export function alterarStatusDoUsuario(id, status, { sinal } = {}) {
  return http.patch(`/api/admin/usuarios/${id}/status`, { status }, { sinal, autenticado });
}

export function reenviarConvite(id, { sinal } = {}) {
  return http.post(`/api/admin/usuarios/${id}/convite`, undefined, { sinal, autenticado });
}

/* ------------------------------------------------------------ unidades e catálogos */

export function listarUnidades({ sinal } = {}) {
  return http.get("/api/admin/unidades", { sinal, autenticado });
}

export function buscarMetricasDeUnidades({ sinal } = {}) {
  return http.get("/api/admin/unidades/metricas", { sinal, autenticado });
}

export function criarUnidade(dados, { sinal } = {}) {
  return http.post("/api/admin/unidades", dados, { sinal, autenticado });
}

export function alterarUnidade(id, dados, { sinal } = {}) {
  return http.put(`/api/admin/unidades/${id}`, dados, { sinal, autenticado });
}

/** `status`: "ativa" | "manutencao" | "inativa". */
export function alterarStatusDaUnidade(id, status, { sinal } = {}) {
  return http.patch(`/api/admin/unidades/${id}/status`, { status }, { sinal, autenticado });
}

export function listarEspecialidades({ sinal } = {}) {
  return http.get("/api/admin/especialidades", { sinal, autenticado });
}

export function listarConvenios({ sinal } = {}) {
  return http.get("/api/admin/convenios", { sinal, autenticado });
}

export function listarTiposDeExame({ sinal } = {}) {
  return http.get("/api/admin/tipos-exame", { sinal, autenticado });
}

/* ------------------------------------------------------------ agendamentos */

export function listarAgendamentos({ de, ate, status, unidadeId, medicoId, q, pagina = 0, tamanho = 500, sinal } = {}) {
  return http.get("/api/admin/agendamentos", {
    parametros: { de, ate, status, unidadeId, medicoId, q, pagina, tamanho },
    sinal,
    autenticado,
  });
}

export function buscarMetricasDeAgendamentos({ de, ate, sinal } = {}) {
  return http.get("/api/admin/agendamentos/metricas", { parametros: { de, ate }, sinal, autenticado });
}

/** `mes`: "2026-09". */
export function buscarCalendario({ mes, sinal } = {}) {
  return http.get("/api/admin/agendamentos/calendario", { parametros: { mes }, sinal, autenticado });
}

/** Confirmar, registrar chegada, cancelar...; transição inválida responde 422. */
export function alterarStatusDoAgendamento(id, status, { motivo, sinal } = {}) {
  return http.patch(`/api/admin/agendamentos/${id}/status`, { status, motivo }, { sinal, autenticado });
}

/* ------------------------------------------------------------ financeiro */

/** `de`/`ate` em "2026-09-28"; sem eles, os últimos 7 dias. */
export function buscarResumoFinanceiro({ de, ate, sinal } = {}) {
  return http.get("/api/admin/financeiro/resumo", { parametros: { de, ate }, sinal, autenticado });
}

export function listarTransacoes({ de, ate, status, forma, q, pagina = 0, tamanho = 50, sinal } = {}) {
  return http.get("/api/admin/financeiro/transacoes", {
    parametros: { de, ate, status, forma, q, pagina, tamanho },
    sinal,
    autenticado,
  });
}

/** `{ status: "pago", forma: "pix" }` dá baixa; `{ status: "estornado" }` estorna. */
export function alterarStatusDaTransacao(id, status, { forma, sinal } = {}) {
  return http.patch(`/api/admin/financeiro/transacoes/${id}/status`, { status, forma }, { sinal, autenticado });
}

/** Baixa as transações do período. `formato`: "pdf", "csv" ou "excel" (CSV). */
export function exportarFinanceiro({ de, ate, status, formato = "pdf" } = {}) {
  const busca = new URLSearchParams(Object.entries({ de, ate, status, formato }).filter(([, v]) => v));
  return baixarArquivo(`/api/admin/financeiro/exportar?${busca}`, { nomePadrao: `financeiro.${formato === "pdf" ? "pdf" : "csv"}` });
}

/* ------------------------------------------------------------ relatórios */

export function buscarResumoDeRelatorios({ de, ate, status, unidadeId, medicoId, especialidadeId, sinal } = {}) {
  return http.get("/api/admin/relatorios/resumo", {
    parametros: { de, ate, status, unidadeId, medicoId, especialidadeId },
    sinal,
    autenticado,
  });
}

/** `tipo`: agendamentos, atendimentos, cancelamentos ou pacientes. */
export function exportarRelatorio(tipo, { de, ate, status, unidadeId, medicoId, especialidadeId, formato = "pdf" } = {}) {
  const busca = new URLSearchParams(
    Object.entries({ tipo, formato, de, ate, status, unidadeId, medicoId, especialidadeId }).filter(([, v]) => v),
  );
  return baixarArquivo(`/api/admin/relatorios/exportar?${busca}`, { nomePadrao: `${tipo}.${formato === "pdf" ? "pdf" : "csv"}` });
}

/* ------------------------------------------------------------ sistema */

export function buscarConfiguracoes({ sinal } = {}) {
  return http.get("/api/admin/configuracoes", { sinal, autenticado });
}

/** Substitui o objeto do grupo ("gerais", "agendamento", "seguranca", "notificacoes", "integracoes"). */
export function salvarConfiguracao(grupo, valor, { sinal } = {}) {
  return http.put(`/api/admin/configuracoes/${grupo}`, valor, { sinal, autenticado });
}

/** `{ modulos, papeis, matriz: { modulo: { PAPEL: boolean } } }`. Só ADMIN. */
export function buscarPermissoes({ sinal } = {}) {
  return http.get("/api/admin/permissoes", { sinal, autenticado });
}

export function salvarPermissoes(matriz, { sinal } = {}) {
  return http.put("/api/admin/permissoes", matriz, { sinal, autenticado });
}

export function buscarAuditoria({ usuarioId, acao, de, ate, pagina = 0, tamanho = 50, sinal } = {}) {
  return http.get("/api/admin/auditoria", {
    parametros: { usuarioId, acao, de, ate, pagina, tamanho },
    sinal,
    autenticado,
  });
}
