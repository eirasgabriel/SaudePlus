/* Regras puras da busca de profissionais: URL → consulta → parâmetros da API,
   resposta da API → cartão, e o filtro local usado quando a API não responde.
   Sem React, para poderem ser testadas direto (scripts/busca.test.mjs). */

import { PROFESSIONALS } from "./data/professionals.js";
import { SPECIALTIES } from "./data/specialties.js";
import { CITIES, CARE_TYPES, SPECIALTY_NAMES } from "./data/buscar.js";

const normalize = (text = "") => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const SLUG_POR_NOME = Object.fromEntries(SPECIALTIES.map((s) => [s.name, s.slug]));

/**
 * Estado inicial do painel a partir da URL (?q=, ?especialidade=, ?cidade=, ?tipo=).
 * `params` é qualquer coisa com `get(nome)`, como `URLSearchParams`.
 */
export function lerConsultaDaUrl(params) {
  const especialidade = params.get("especialidade") ?? "";
  const cidade = params.get("cidade") ?? "";
  const tipo = params.get("tipo");
  const specialty = SPECIALTY_NAMES.find((s) => normalize(s) === normalize(especialidade));
  return {
    // Especialidade que não é do catálogo vira termo de busca.
    term: params.get("q") ?? (specialty ? "" : especialidade),
    // "Cidade - UF": as cidades da API podem não estar na lista local.
    city: /^.+ - [A-Z]{2}$/.test(cidade) ? cidade : CITIES[0],
    specialty: specialty ?? "",
    type: CARE_TYPES.some((t) => t.value === tipo) ? tipo : "",
  };
}

/** "São Paulo - SP" → { cidade: "São Paulo", uf: "SP" }. */
export function separarCidade(rotulo = "") {
  const corte = rotulo.lastIndexOf(" - ");
  return corte > 0 ? { cidade: rotulo.slice(0, corte), uf: rotulo.slice(corte + 3) } : { cidade: rotulo, uf: undefined };
}

/**
 * O painel de busca escolhe um valor único e a barra lateral uma lista; os
 * dois precisam valer juntos. Devolve a lista a enviar, ou `null` quando a
 * combinação é impossível (painel "Cardiologia" com barra só "Pediatria").
 */
function combinar(unico, lista) {
  if (!unico) return lista;
  return lista.length && !lista.includes(unico) ? null : [unico];
}

/**
 * Parâmetros de `GET /api/publico/profissionais` para `{ applied, filters, sort }`,
 * ou `null` quando os filtros se contradizem (nada a buscar).
 */
export function montarParametros({ applied, filters, sort }, tamanho) {
  const especialidades = combinar(applied.specialty, filters.specialties);
  const modalidades = combinar(applied.type, filters.types);
  if (especialidades === null || modalidades === null) return null;
  const { cidade, uf } = separarCidade(applied.city);
  return {
    q: applied.term.trim() || undefined,
    cidade: cidade || undefined,
    uf,
    especialidade: especialidades.map((nome) => SLUG_POR_NOME[nome] ?? nome),
    modalidade: modalidades,
    convenio: filters.insurances,
    ordem: sort,
    tamanho,
  };
}

function enderecoCompleto(local) {
  if (!local) return "";
  const rua = local.bairro ? `${local.endereco} - ${local.bairro}` : local.endereco;
  return `${rua}, ${local.cidade} - ${local.uf}`;
}

/** Resposta da API no formato que o ProfessionalCard já recebia dos mocks. */
export function paraCartao(p) {
  return {
    id: p.id,
    name: p.nome,
    specialty: p.especialidades.map((e) => e.nome).join(", "),
    crm: `CRM ${p.crm}-${p.crmUf}`,
    rating: Number(p.nota),
    reviews: p.avaliacoes,
    address: enderecoCompleto(p.local),
    city: p.local ? `${p.local.cidade} - ${p.local.uf}` : "",
    types: p.modalidades,
    insurances: p.convenios,
    slots: p.proximosHorarios,
    slotsDate: p.proximaData,
    photo: p.fotoUrl,
  };
}

/** Mesma filtragem que a tela fazia antes da API existir. */
export function filtrarMocks({ applied, filters, sort }) {
  const term = normalize(applied.term.trim());
  const list = PROFESSIONALS.filter((p) => {
    if (term && !normalize(`${p.name} ${p.specialty}`).includes(term)) return false;
    if (applied.city && p.city !== applied.city) return false;
    if (applied.specialty && p.specialty !== applied.specialty) return false;
    if (applied.type && !p.types.includes(applied.type)) return false;
    if (filters.types.length && !filters.types.some((t) => p.types.includes(t))) return false;
    if (filters.specialties.length && !filters.specialties.includes(p.specialty)) return false;
    if (filters.insurances.length && !filters.insurances.some((i) => p.insurances.includes(i))) return false;
    return true;
  });
  const sorters = {
    relevancia: () => 0,
    avaliacao: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    avaliacoes: (a, b) => b.reviews - a.reviews,
    nome: (a, b) => a.name.localeCompare(b.name, "pt-BR"),
  };
  return [...list].sort(sorters[sort]);
}
