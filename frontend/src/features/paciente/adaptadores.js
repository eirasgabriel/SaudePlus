/* Converte as respostas da API para o formato que as telas do paciente já
   recebiam dos mocks (services/dadosficticios.js). Assim as telas continuam
   sem saber de onde os dados vêm. */

/** Consulta → formato de `mockAppointments`, mais os campos que as ações usam. */
export function paraConsulta(consulta) {
  return {
    id: consulta.id,
    dateTime: consulta.inicio,
    clinic: consulta.unidade.nome,
    address: consulta.unidade.endereco,
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
  return { name: paciente.nome, role: "Paciente", avatarUrl: paciente.fotoUrl ?? null };
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
