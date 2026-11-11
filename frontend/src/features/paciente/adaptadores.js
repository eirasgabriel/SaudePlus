/* Converte as respostas da API para o formato que as telas do paciente já
   recebiam dos mocks (services/dadosficticios.js). Assim as telas continuam
   sem saber de onde os dados vêm. */
import { enderecoDaApi } from "../../services/http.js";

/** Consulta → formato de `mockAppointments`, mais os campos que as ações usam. */
export function paraConsulta(consulta) {
  return {
    id: consulta.id,
    dateTime: consulta.inicio,
    fim: consulta.fim,
    clinic: consulta.unidade.nome,
    address: consulta.unidade.endereco,
    phone: consulta.unidade.telefone ?? "",
    specialty: consulta.especialidade.nome,
    professional: consulta.medico.nome,
    status: consulta.status,
    podeAlterar: consulta.podeAlterar,
    medicoId: consulta.medico.id,
    especialidadeId: consulta.especialidade.id,
  };
}

/** Unidade → formato de `mockUnit`. */
export function paraUnidade(unidade) {
  if (!unidade) return null;
  return {
    name: unidade.nome,
    address: unidade.endereco,
    phone: unidade.telefone ?? "",
    hours: unidade.horarioFuncionamento ?? "",
    mapUrl: unidade.mapUrl ?? "#",
  };
}

/** Paciente do painel → formato de `mockPatient`. */
export function paraPaciente(paciente) {
  return { name: paciente.nome, role: "Paciente", avatarUrl: enderecoDaApi(paciente.fotoUrl) };
}

/** Os status de exame da API com os rótulos que a ExamesPage já usa. */
const STATUS_DO_EXAME = { em_analise: "em análise" };

/** Exame → formato de `mockExams`. Sem data marcada, usa o prazo como referência. */
export function paraExame(exame) {
  return {
    id: exame.id,
    dateTime: exame.dataHora ?? (exame.prazo ? `${exame.prazo}T12:00:00` : null),
    name: exame.nome,
    category: exame.categoria,
    clinic: exame.unidade ?? "A definir",
    professional: exame.medico ?? "",
    status: STATUS_DO_EXAME[exame.status] ?? exame.status,
    // Sem link direto: o arquivo exige o token (ver `aoBaixarResultado` da ExamesPage).
    resultUrl: null,
    resultadoDisponivel: exame.resultadoDisponivel,
    preparo: exame.preparo,
  };
}

/** Atendimento → formato de `mockHistory`, mais a nota dada. */
export function paraAtendimento(atendimento) {
  return {
    id: atendimento.id,
    dateTime: atendimento.inicio,
    clinic: atendimento.unidade,
    specialty: atendimento.especialidade,
    professional: atendimento.medico,
    summary: atendimento.resumo ?? "",
    outcome: atendimento.desfecho,
    avaliacao: atendimento.avaliacao,
  };
}

/* Ícone e destino de cada tipo de notificação no sino do painel. */
const DO_TIPO_DE_NOTIFICACAO = {
  resultado: { icone: "frasco", para: "/paciente/exames" },
  agendamento: { icone: "calendario", para: "/paciente/consultas" },
  retorno: { icone: "calendario", para: "/paciente/consultas" },
  cancelamento: { icone: "calendario", para: "/paciente/consultas" },
  sistema: { icone: "sino", para: "/paciente/notificacoes" },
};

/** Notificação da API (`GET /api/paciente/notificacoes`) no formato do sino do painel. */
export function paraNotificacao(notificacao) {
  const tipo = String(notificacao.tipo ?? "").toLowerCase();
  const { icone, para } = DO_TIPO_DE_NOTIFICACAO[tipo] ?? DO_TIPO_DE_NOTIFICACAO.sistema;
  return {
    id: notificacao.id,
    icone,
    titulo: notificacao.titulo,
    texto: notificacao.detalhe ?? "",
    quando: notificacao.quando ?? "",
    lida: Boolean(notificacao.lida),
    para,
  };
}

const STATUS_QUE_OCUPAM = new Set(["pendente", "confirmada", "aguardando", "em_andamento"]);

/**
 * Horários já tomados pelo paciente, no formato `ocupados` do
 * ModalAgendamento. `ignorar`: id da consulta que está sendo remarcada.
 */
export function ocupadosDe(consultas, ignorar = null) {
  return consultas
    .filter((c) => c.fim && STATUS_QUE_OCUPAM.has(c.status) && c.id !== ignorar)
    .map((c) => ({ inicio: c.dateTime, fim: c.fim }));
}
