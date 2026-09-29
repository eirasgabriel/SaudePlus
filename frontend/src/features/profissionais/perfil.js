/* Regras puras do perfil do profissional e do pedido de agendamento que sai
   dele (ou do cartão da busca) para a área do paciente. Sem React, testadas
   em scripts/perfil.test.mjs. */

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const formatoDia = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });

export const ROTULO_DA_MODALIDADE = {
  presencial: "Consulta presencial",
  online: "Consulta on-line",
  domiciliar: "Atendimento domiciliar",
};

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Data local de `agora` em ISO ("2026-09-28"). */
function isoLocal(agora) {
  const doisDigitos = (n) => String(n).padStart(2, "0");
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

/** "2026-09-29" → "hoje", "amanhã" ou "qua., 30/09" (datas ISO, sem fuso). */
export function rotuloDoDia(iso, agora = new Date()) {
  if (!iso) return "";
  const hoje = isoLocal(agora);
  const amanha = new Date(`${hoje}T12:00:00Z`);
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  if (iso === hoje) return "hoje";
  if (iso === amanha.toISOString().slice(0, 10)) return "amanhã";
  return formatoDia.format(new Date(`${iso}T12:00:00Z`));
}

function enderecoDa(unidade) {
  const rua = unidade.bairro ? `${unidade.endereco} - ${unidade.bairro}` : unidade.endereco;
  return `${rua}, ${unidade.cidade} - ${unidade.uf}`;
}

/** `GET /api/publico/profissionais/{id}` → o que a página de perfil mostra. */
export function paraPerfil(d) {
  const valor = d.valorConsulta == null ? null : Number(d.valorConsulta);
  return {
    id: d.id,
    nome: d.nome,
    fotoUrl: d.fotoUrl ?? null,
    crm: `CRM ${d.crm}-${d.crmUf}`,
    bio: d.bio?.trim() || null,
    especialidades: d.especialidades,
    nota: Number(d.nota ?? 0),
    avaliacoes: d.avaliacoes ?? 0,
    valorConsulta: valor == null ? null : moeda.format(valor),
    modalidades: d.modalidades.map((m) => ({ id: m, rotulo: ROTULO_DA_MODALIDADE[m] ?? m })),
    convenios: d.convenios,
    unidades: d.unidades.map((u) => ({
      id: u.id,
      nome: u.nome,
      endereco: enderecoDa(u),
      telefone: u.telefone ?? null,
      horario: u.horarioFuncionamento ?? null,
      mapUrl: u.mapUrl ?? null,
    })),
  };
}

/**
 * Horários livres da API agrupados por dia, em ordem, até `maxDias` dias.
 * O mesmo horário em duas modalidades vira um só botão.
 */
export function agruparHorarios(livres, maxDias = 5) {
  const porDia = new Map();
  for (const { data, horario } of livres) {
    if (!porDia.has(data)) porDia.set(data, new Set());
    porDia.get(data).add(horario);
  }
  return [...porDia.keys()]
    .sort()
    .slice(0, maxDias)
    .map((data) => ({ data, horarios: [...porDia.get(data)].sort() }));
}

/**
 * Endereço que abre o agendamento na área do paciente com o profissional (e,
 * se vier, o dia e o horário) já escolhidos. Sem login, a rota protegida
 * guarda o endereço e volta a ele depois do login.
 */
export function linkDeAgendamento(medicoId, { data, horario } = {}) {
  const busca = new URLSearchParams({ agendar: medicoId });
  if (data && DATA_ISO.test(data)) {
    busca.set("data", data);
    if (horario && HORARIO.test(horario)) busca.set("horario", horario);
  }
  return `/paciente/consultas?${busca}`;
}

/**
 * Lê o pedido de `linkDeAgendamento` da URL: `{ medicoId, data, horario }`,
 * ou `null` sem `agendar`. Data e horário fora do formato são ignorados.
 */
export function lerPedidoDeAgendamento(params) {
  const medicoId = params.get("agendar")?.trim();
  if (!medicoId) return null;
  const data = params.get("data") ?? "";
  const horario = params.get("horario") ?? "";
  const dataValida = DATA_ISO.test(data);
  return {
    medicoId,
    data: dataValida ? data : "",
    horario: dataValida && HORARIO.test(horario) ? horario : "",
  };
}

/**
 * Resultado da busca da API → cartão de "Profissionais em destaque"
 * (DoctorCard), com o link para o perfil.
 */
export function paraDestaque(p) {
  return {
    id: p.id,
    name: p.nome,
    specialty: p.especialidades[0]?.nome ?? "",
    rating: Number(p.nota ?? 0),
    reviews: p.avaliacoes ?? 0,
    photo: p.fotoUrl ?? null,
    perfilHref: `/profissionais/${encodeURIComponent(p.id)}`,
  };
}
