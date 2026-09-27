/* Dados fictícios do Dashboard do Médico.
   Na integração, substituir pelo retorno da API mantendo o mesmo formato.
   Nenhum valor exibido na tela é escrito direto no JSX: os contadores e as
   iniciais dos pacientes são derivados destes dados em `../selectors.js`. */

/** Dia de referência do painel (ISO). A tela formata em pt-BR. */
export const DATA_REFERENCIA = "2026-09-15";

export const MEDICO = {
  nome: "Dr. Carlos Mendes",
  perfil: "Médico",
  especialidade: "Clínico Geral",
  crm: "CRM 123.456-RJ",
  avatarUrl: null, // ex.: 'https://.../carlos.jpg'
};

export const UNIDADE = {
  nome: "Clínica da Família – Centro",
  cidade: "Saquarema",
  endereco: "Rua das Flores, 123 – Saquarema, RJ",
  telefone: "(22) 2655-1234",
  horario: "Segunda a Sexta - 07h às 17h",
  mapUrl: "#",
};

export const FRASE_DO_DIA = "Cuidar de pessoas é o que nos move todos os dias.";

/* ----------------------------------------------------------------
   Status de consulta — fonte única de rótulo e cor.
   A ordem também define a ordem dos filtros da agenda.
   ---------------------------------------------------------------- */
export const STATUS_CONSULTA = {
  realizada: { rotulo: "Realizada", tom: "sucesso", concluida: true },
  em_andamento: { rotulo: "Em andamento", tom: "info", concluida: false },
  aguardando: { rotulo: "Aguardando", tom: "alerta", concluida: false },
  confirmada: { rotulo: "Confirmada", tom: "neutro", concluida: false },
};

/** Agenda do dia. `horario` em HH:MM, 24h. */
export const AGENDA = [
  { id: "ag-1", horario: "08:00", pacienteId: "ana-paula-ferreira", tipo: "Consulta de rotina", status: "realizada" },
  { id: "ag-2", horario: "08:40", pacienteId: "joao-gabriel-santos", tipo: "Consulta pediátrica", status: "realizada" },
  { id: "ag-3", horario: "09:20", pacienteId: "mariana-costa", tipo: "Retorno - Exames", status: "realizada" },
  { id: "ag-4", horario: "10:00", pacienteId: "carlos-eduardo-lima", tipo: "Consulta clínica geral", status: "em_andamento" },
  { id: "ag-5", horario: "10:40", pacienteId: "fernanda-alves", tipo: "Consulta de rotina", status: "aguardando" },
  { id: "ag-6", horario: "11:20", pacienteId: "roberto-silva", tipo: "Consulta retorno", status: "aguardando" },
  { id: "ag-7", horario: "14:00", pacienteId: "juliana-rocha", tipo: "Consulta de rotina", status: "confirmada" },
  { id: "ag-8", horario: "14:40", pacienteId: "lucas-martins", tipo: "Consulta clínica geral", status: "confirmada" },
];

/** Pacientes do médico. As iniciais do avatar são derivadas do nome. */
export const PACIENTES = [
  { id: "ana-paula-ferreira", nome: "Ana Paula Ferreira", idade: 32, motivo: "Consulta de rotina" },
  { id: "joao-gabriel-santos", nome: "João Gabriel Santos", idade: 5, motivo: "Pediatria" },
  { id: "mariana-costa", nome: "Mariana Costa", idade: 28, motivo: "Retorno - Exames" },
  { id: "carlos-eduardo-lima", nome: "Carlos Eduardo Lima", idade: 45, motivo: "Clínica geral" },
  { id: "fernanda-alves", nome: "Fernanda Alves", idade: 60, motivo: "Consulta de rotina" },
  { id: "roberto-silva", nome: "Roberto Silva", idade: 51, motivo: "Consulta retorno" },
  { id: "juliana-rocha", nome: "Juliana Rocha", idade: 37, motivo: "Consulta de rotina" },
  { id: "lucas-martins", nome: "Lucas Martins", idade: 24, motivo: "Clínica geral" },
];

/** Exames aguardando resultado. `prazo` já vem pronto para exibição. */
export const EXAMES_PENDENTES = [
  { id: "ex-1", nome: "Hemograma completo", pacienteId: "joao-gabriel-santos", prazo: "Hoje" },
  { id: "ex-2", nome: "Ultrassom abdominal", pacienteId: "mariana-costa", prazo: "Amanhã" },
  { id: "ex-3", nome: "Raio-X tórax", pacienteId: "carlos-eduardo-lima", prazo: "12/10" },
];

/** tipo aceito: 'resultado' | 'agendamento' | 'retorno' */
export const NOTIFICACOES = [
  {
    id: "nt-1",
    tipo: "resultado",
    titulo: "Resultado de exame disponível",
    detalhe: "Mariana Costa – Ultrassom abdominal",
    quando: "Hoje, 09:15",
    lida: false,
  },
  {
    id: "nt-2",
    tipo: "agendamento",
    titulo: "Novo agendamento",
    detalhe: "Lucas Martins – 14:40",
    quando: "Hoje, 08:50",
    lida: false,
  },
  {
    id: "nt-3",
    tipo: "retorno",
    titulo: "Lembrete de retorno",
    detalhe: "João Gabriel Santos – 22/09",
    quando: "Ontem, 17:20",
    lida: false,
  },
];
