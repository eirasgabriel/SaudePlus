/* Dados fictícios da tela de Relatórios. */

export const metricas = [
  {
    id: "atendimentos",
    rotulo: "Total de atendimentos",
    valor: "2.348",
    icone: "usuarios",
    nota: "no período selecionado",
    variacao: { valor: "12%", tendencia: "sobe" },
  },
  {
    id: "agendamentos",
    rotulo: "Agendamentos realizados",
    valor: "2.176",
    icone: "calendarioMais",
    nota: "no período selecionado",
    variacao: { valor: "15%", tendencia: "sobe" },
  },
  {
    id: "pacientes",
    rotulo: "Pacientes atendidos",
    valor: "1.842",
    icone: "usuario",
    nota: "no período selecionado",
    variacao: { valor: "10%", tendencia: "sobe" },
  },
  {
    id: "espera",
    rotulo: "Tempo médio de espera",
    valor: "18 min",
    icone: "relogio",
    nota: "no período selecionado",
    variacao: { valor: "6%", tendencia: "desce" },
  },
  {
    id: "cancelamentos",
    rotulo: "Cancelamentos",
    valor: "156",
    icone: "alertaX",
    nota: "no período selecionado",
    tom: "vermelho",
    variacao: { valor: "3%", tendencia: "sobe" },
  },
];

export const porEspecialidade = {
  total: "2.348",
  descricao: "atendimentos",
  fatias: [
    { id: "geral", rotulo: "Clínica Geral", percentual: 34, cor: "var(--azul)" },
    { id: "pediatria", rotulo: "Pediatria", percentual: 18, cor: "var(--azul-suave)" },
    { id: "ginecologia", rotulo: "Ginecologia", percentual: 14, cor: "var(--verde-claro)" },
    { id: "ortopedia", rotulo: "Ortopedia", percentual: 10, cor: "var(--roxo)" },
    { id: "outras", rotulo: "Outras", percentual: 24, cor: "#c4b5fd" },
  ],
};

export const evolucaoAtendimentos = {
  escalaMaxima: 2500,
  passo: 500,
  dados: [
    { rotulo: "Jan", valor: 920 },
    { rotulo: "Fev", valor: 1010 },
    { rotulo: "Mar", valor: 1180 },
    { rotulo: "Abr", valor: 1280 },
    { rotulo: "Mai", valor: 1420 },
    { rotulo: "Jun", valor: 1560 },
    { rotulo: "Jul", valor: 1700 },
    { rotulo: "Ago", valor: 1980 },
    { rotulo: "Set", valor: 2180 },
    { rotulo: "Out", valor: 2280 },
  ],
};

export const porFaixaEtaria = [
  { rotulo: "0 a 18 anos", percentual: 22 },
  { rotulo: "19 a 30 anos", percentual: 34 },
  { rotulo: "31 a 50 anos", percentual: 26 },
  { rotulo: "51 a 70 anos", percentual: 12 },
  { rotulo: "+ 70 anos", percentual: 6 },
];

export const relatoriosDisponiveis = [
  {
    id: "atendimentos",
    titulo: "Relatório de Atendimentos",
    descricao: "Lista de atendimentos realizados no período selecionado.",
    icone: "grafico",
  },
  {
    id: "agendamentos",
    titulo: "Relatório de Agendamentos",
    descricao: "Detalhamento dos agendamentos por data, unidade e especialidade.",
    icone: "calendario",
  },
  {
    id: "pacientes",
    titulo: "Relatório de Pacientes",
    descricao: "Informações cadastrais e histórico de atendimentos.",
    icone: "usuarios",
  },
  {
    id: "financeiro",
    titulo: "Relatório Financeiro",
    descricao: "Movimentações financeiras e faturamento das clínicas.",
    icone: "banco",
  },
  {
    id: "cancelamentos",
    titulo: "Relatório de Cancelamentos",
    descricao: "Motivos e quantidade de agendamentos cancelados.",
    icone: "alertaX",
  },
];

export const resumoPeriodo = [
  { id: "unidade", rotulo: "Atendimentos por unidade", valor: "1.245", icone: "clinica" },
  { id: "profissional", rotulo: "Atendimentos por profissional", valor: "1.103", icone: "usuarios" },
  { id: "consultas", rotulo: "Consultas", valor: "1.876", icone: "estetoscopio" },
  { id: "exames", rotulo: "Exames", valor: "472", icone: "frasco" },
  { id: "retornos", rotulo: "Retornos", valor: "356", icone: "atualizar" },
];

/* --- opções dos filtros avançados --- */
export const opcoesProfissional = [
  { valor: "todos", rotulo: "Todos os profissionais" },
  { valor: "ana", rotulo: "Dra. Ana Costa" },
  { valor: "carlos", rotulo: "Dr. Carlos Mendes" },
  { valor: "rafael", rotulo: "Dr. Rafael Lima" },
  { valor: "fernanda", rotulo: "Dra. Fernanda Rocha" },
];

export const opcoesUnidade = [
  { valor: "todas", rotulo: "Todas as unidades" },
  { valor: "centro", rotulo: "Clínica da Família - Centro" },
  { valor: "jacone", rotulo: "Posto de Saúde - Jaconé" },
  { valor: "policlinica", rotulo: "Policlínica Municipal" },
  { valor: "hospital", rotulo: "Hospital Municipal" },
];

export const opcoesStatus = [
  { valor: "todos", rotulo: "Todos os status" },
  { valor: "confirmado", rotulo: "Confirmados" },
  { valor: "espera", rotulo: "Em espera" },
  { valor: "cancelado", rotulo: "Cancelados" },
];

export const opcoesEspecialidade = [
  { valor: "todas", rotulo: "Todas as especialidades" },
  { valor: "geral", rotulo: "Clínica Geral" },
  { valor: "pediatria", rotulo: "Pediatria" },
  { valor: "ginecologia", rotulo: "Ginecologia" },
  { valor: "ortopedia", rotulo: "Ortopedia" },
];

export const opcoesFormato = [
  { valor: "pdf", rotulo: "PDF" },
  { valor: "excel", rotulo: "Excel (.xlsx)" },
  { valor: "csv", rotulo: "CSV" },
];

export const opcoesPeriodo = [
  { valor: "30d", rotulo: "15 de setembro de 2026 - 15 de outubro de 2026" },
  { valor: "7d", rotulo: "Últimos 7 dias" },
  { valor: "90d", rotulo: "Últimos 90 dias" },
  { valor: "ano", rotulo: "Este ano" },
];
