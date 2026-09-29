/* Formatos de exibição em pt-BR para o que vem da API. */

const DATA = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const DATA_HORA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "2026-09-29" → "29/09/2026" sem passar por fuso (é uma data local). */
export function dataBr(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = String(iso).slice(0, 10).split("-").map(Number);
  return DATA.format(new Date(ano, mes - 1, dia));
}

/** Instante ("2026-09-29T18:00:00Z") ou data-hora local ("2026-09-29T08:00") → "29/09/2026 08:00". */
export function dataHoraBr(valor) {
  if (!valor) return "";
  return DATA_HORA.format(new Date(valor)).replace(",", "");
}

export function moeda(valor) {
  return valor === null || valor === undefined || valor === "" ? "" : MOEDA.format(Number(valor));
}

/** Data de hoje no fuso do navegador, em ISO ("2026-09-29"). */
export function hojeIso(deslocamentoDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + deslocamentoDias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const ROTULO_STATUS_EXAME = {
  solicitado: "Solicitado",
  agendado: "Coleta agendada",
  em_analise: "Em análise",
  liberado: "Resultado liberado",
  cancelado: "Cancelado",
};

export const ROTULO_MODALIDADE = { presencial: "Presencial", online: "On-line", domiciliar: "Domiciliar" };

export const DIAS_DA_SEMANA = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
