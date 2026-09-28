/* Regras de leitura do painel do médico.
   Tudo que a tela mostra como número sai daqui — nunca escrito no JSX.
   Quando a API entrar, só estes cálculos mudam de origem. */

import { AGENDA, EXAMES_PENDENTES, PACIENTES, STATUS_CONSULTA } from "./data/medico.js";

/** "Ana Paula Ferreira" -> "AF" (primeira e última palavra relevante). */
export function iniciais(nome = "") {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-ZÀ-Ý]/.test(p));
  if (partes.length === 0) return "";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${primeira}${ultima}`.toUpperCase();
}

/** Consulta o cadastro de pacientes por id. */
export function buscarPaciente(pacienteId, pacientes = PACIENTES) {
  return pacientes.find((p) => p.id === pacienteId) ?? null;
}

/**
 * Junta cada item da agenda com o nome do paciente correspondente.
 *
 * Quando o item já traz `paciente` — é o caso da resposta da API, que
 * resolve o nome no servidor — o valor é mantido. Assim a mesma tela
 * funciona com os mocks e com o back-end, sem dois caminhos de código.
 */
export function agendaComPacientes(agenda = AGENDA, pacientes = PACIENTES) {
  return agenda.map((consulta) => ({
    ...consulta,
    paciente: consulta.paciente ?? buscarPaciente(consulta.pacienteId, pacientes)?.nome ?? "Paciente",
  }));
}

/** Exames pendentes com o nome do paciente resolvido, mesma regra acima. */
export function examesComPacientes(exames = EXAMES_PENDENTES, pacientes = PACIENTES) {
  return exames.map((exame) => ({
    ...exame,
    paciente: exame.paciente ?? buscarPaciente(exame.pacienteId, pacientes)?.nome ?? "Paciente",
  }));
}

/** Consultas ainda não iniciadas, na ordem do dia. */
export function proximasConsultas(agenda = AGENDA) {
  return agenda.filter(({ status }) => !STATUS_CONSULTA[status]?.concluida && status !== "em_andamento");
}

/** Quantas consultas existem em cada status. Alimenta os filtros da agenda. */
export function contagemPorStatus(agenda = AGENDA) {
  return Object.keys(STATUS_CONSULTA).reduce((acc, chave) => {
    acc[chave] = agenda.filter((c) => c.status === chave).length;
    return acc;
  }, {});
}

/**
 * Os quatro cartões de resumo do topo.
 *
 * Definições (mudou a regra? mude só aqui):
 * - consultasHoje ....... total de itens na agenda do dia
 * - pacientesAtendidos .. consultas com status concluído (`realizada`)
 * - examesPendentes ..... exames aguardando resultado
 * - proximasConsultas ... consultas que ainda não começaram, e o horário da primeira
 */
export function resumoDoDia(agenda = AGENDA, exames = EXAMES_PENDENTES) {
  const proximas = proximasConsultas(agenda);
  const atendidos = agenda.filter(({ status }) => STATUS_CONSULTA[status]?.concluida).length;

  return {
    consultasHoje: agenda.length,
    pacientesAtendidos: atendidos,
    examesPendentes: exames.length,
    proximasConsultas: proximas.length,
    primeiroHorarioPendente: proximas[0]?.horario ?? null,
  };
}

/**
 * Filtra a agenda.
 *
 * Além dos status, aceita dois filtros que não são status:
 * - "todas"     devolve tudo (o mesmo que não filtrar);
 * - "pendentes" devolve o que ainda não começou, que é exatamente o número
 *               do cartão "Próximas consultas" — assim o cartão e o filtro
 *               nunca mostram contas diferentes.
 */
export function filtrarAgenda(agenda, status) {
  if (!status || status === "todas") return agenda;
  if (status === "pendentes") return proximasConsultas(agenda);
  return agenda.filter((consulta) => consulta.status === status);
}

/** 15 de setembro de 2026 */
const formatoData = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function dataPorExtenso(iso) {
  return formatoData.format(new Date(`${iso}T12:00:00Z`));
}
