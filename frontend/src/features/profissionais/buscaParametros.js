/* Regras puras da busca de profissionais: URL → consulta → parâmetros da API,
   resposta da API → cartão. Não há filtro local: a busca vem só da API.
   Sem React, para poderem ser testadas direto (scripts/busca.test.mjs). */

import { SPECIALTIES } from "./data/specialties.js";
import { CITIES, CARE_TYPES, SPECIALTY_NAMES } from "./data/buscar.js";
import { enderecoDaApi } from "../../services/http.js";

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
    photo: enderecoDaApi(p.fotoUrl),
  };
}

