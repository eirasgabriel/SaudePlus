/* Dados fictícios da Dashboard. */
import { fotos } from "./fotosPacientes";

export const metricas = [
  {
    id: "usuarios",
    rotulo: "Usuários cadastrados",
    valor: "4.862",
    icone: "usuarios",
    nota: "comparado ao mês anterior",
    variacao: { valor: "12%", tendencia: "sobe" },
  },
  {
    id: "agendamentos",
    rotulo: "Agendamentos no mês",
    valor: "2.348",
    icone: "calendarioCheck",
    nota: "comparado ao mês anterior",
    variacao: { valor: "18%", tendencia: "sobe" },
  },
  {
    id: "clinicas",
    rotulo: "Clínicas ativas",
    valor: "12",
    icone: "clinica",
    nota: "de 12 cadastradas",
    variacao: { valor: "0%", tendencia: "neutra" },
  },
  {
    id: "exames",
    rotulo: "Exames disponíveis",
    valor: "58",
    icone: "documento",
    nota: "cadastrados no sistema",
    variacao: { valor: "5%", tendencia: "sobe" },
  },
  {
    id: "cancelamentos",
    rotulo: "Cancelamentos",
    valor: "156",
    icone: "alerta",
    tom: "vermelho",
    nota: "comparado ao mês anterior",
    variacao: { valor: "8%", tendencia: "desce" },
  },
];

export const agendamentosPorMes = {
  escalaMaxima: 2500,
  passo: 500,
  dados: [
    { rotulo: "Jan", valor: 920 },
    { rotulo: "Fev", valor: 1120 },
    { rotulo: "Mar", valor: 1180 },
    { rotulo: "Abr", valor: 1350 },
    { rotulo: "Mai", valor: 1340 },
    { rotulo: "Jun", valor: 1560 },
    { rotulo: "Jul", valor: 1620 },
    { rotulo: "Ago", valor: 1980 },
    { rotulo: "Set", valor: 2230 },
  ],
};

export const periodosGrafico = [
  { valor: "9m", rotulo: "Últimos 9 meses" },
  { valor: "6m", rotulo: "Últimos 6 meses" },
  { valor: "3m", rotulo: "Últimos 3 meses" },
  { valor: "12m", rotulo: "Últimos 12 meses" },
];

export const tiposAtendimento = {
  total: "2.348",
  descricao: "agendamentos",
  fatias: [
    { id: "consultas", rotulo: "Consultas", percentual: 62, cor: "var(--azul)" },
    { id: "exames", rotulo: "Exames", percentual: 23, cor: "var(--azul-suave)" },
    { id: "retornos", rotulo: "Retornos", percentual: 10, cor: "var(--verde-claro)" },
    { id: "outros", rotulo: "Outros", percentual: 5, cor: "var(--roxo)" },
  ],
};

export const acoesRapidas = [
  { id: "usuarios", rotulo: "Gerenciar usuários", icone: "usuarios", para: "/admin/usuarios" },
  { id: "clinicas", rotulo: "Gerenciar clínicas", icone: "clinica", para: "/admin/clinicas" },
  { id: "relatorios", rotulo: "Visualizar relatórios", icone: "grafico", para: "/admin/relatorios" },
  { id: "config", rotulo: "Configurações do sistema", icone: "engrenagem", para: "/admin/configuracoes" },
];

export const clinicasMaisAcessadas = [
  {
    id: 1,
    nome: "Clínica da Família – Centro",
    endereco: "Rua das Flores, 123 – Saquarema, RJ",
    agendamentos: 842,
    status: "ativa",
  },
  {
    id: 2,
    nome: "Posto de Saúde – Jaconé",
    endereco: "Av. Beira Mar, 456 – Jaconé, RJ",
    agendamentos: 623,
    status: "ativa",
  },
  {
    id: 3,
    nome: "Policlínica Municipal",
    endereco: "Av. Saquarema, 789 – Saquarema, RJ",
    agendamentos: 518,
    status: "ativa",
  },
  {
    id: 4,
    nome: "Clínica da Família – Sampaio Corrêa",
    endereco: "Rua Principal, 321 – Sampaio Corrêa, RJ",
    agendamentos: 402,
    status: "ativa",
  },
  {
    id: 5,
    nome: "Centro de Especialidades",
    endereco: "Av. Oceânica, 654 – Saquarema, RJ",
    agendamentos: 331,
    status: "ativa",
  },
];

export const ultimosAgendamentos = [
  {
    id: 1,
    paciente: "Maria Silva",
    tipo: "Consulta clínica geral",
    medico: "Dr. Carlos Mendes",
    data: "15/09",
    hora: "08:30",
    status: "confirmado",
    foto: fotos.mariaSilva,
  },
  {
    id: 2,
    paciente: "João Pereira",
    tipo: "Exame de sangue",
    medico: "Dr. Rafael Lima",
    data: "15/09",
    hora: "09:15",
    status: "confirmado",
    foto: fotos.joaoPereira,
  },
  {
    id: 3,
    paciente: "Ana Costa",
    tipo: "Consulta pediátrica",
    medico: "Dr. Marcos Antunes",
    data: "15/09",
    hora: "10:00",
    status: "confirmado",
    foto: fotos.anaCosta,
  },
  {
    id: 4,
    paciente: "Carlos Lima",
    tipo: "Retorno",
    medico: "Dr. Carlos Mendes",
    data: "15/09",
    hora: "11:20",
    status: "em_atendimento",
    foto: fotos.carlosLima,
  },
  {
    id: 5,
    paciente: "Fernanda Oliveira",
    tipo: "Exame de imagem",
    medico: "Dra. Ana Souza",
    data: "15/09",
    hora: "14:00",
    status: "confirmado",
    foto: fotos.fernandaOliveira,
  },
];

export const statusAgendamentoDashboard = {
  confirmado: { rotulo: "Confirmado", variante: "sucesso" },
  em_atendimento: { rotulo: "Em atendimento", variante: "info" },
  cancelado: { rotulo: "Cancelado", variante: "erro" },
  // Chaves do status unificado da API (StatusAgendamento).
  pendente: { rotulo: "Pendente", variante: "info" },
  confirmada: { rotulo: "Confirmado", variante: "sucesso" },
  aguardando: { rotulo: "Na recepção", variante: "info" },
  em_andamento: { rotulo: "Em atendimento", variante: "info" },
  realizada: { rotulo: "Realizado", variante: "sucesso" },
  cancelada: { rotulo: "Cancelado", variante: "erro" },
  faltou: { rotulo: "Não compareceu", variante: "erro" },
};

export const notificacoes = [
  {
    id: 1,
    titulo: "Novo usuário cadastrado",
    descricao: "Paciente: Lucas Almeida",
    tempo: "Há 12 min",
    tipo: "aviso",
  },
  {
    id: 2,
    titulo: "Clínica solicitou ativação",
    descricao: "Clínica São José – Jaconé",
    tempo: "Há 25 min",
    tipo: "info",
  },
  {
    id: 3,
    titulo: "Exame com resultado disponível",
    descricao: "Paciente: Juliana Rocha",
    tempo: "Há 1 hora",
    tipo: "sucesso",
  },
  {
    id: 4,
    titulo: "Agendamento cancelado",
    descricao: "Paciente: Roberto Silva",
    tempo: "Há 2 horas",
    tipo: "erro",
  },
  {
    id: 5,
    titulo: "Relatório mensal gerado",
    descricao: "Setembro/2026",
    tempo: "Há 3 horas",
    tipo: "info",
  },
];
