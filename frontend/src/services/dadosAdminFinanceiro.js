/* Dados fictícios da tela Financeiro. */

export const metricas = [
  {
    id: "receita",
    rotulo: "Receita Total",
    valor: "R$ 48.750,00",
    icone: "carteira",
    variacao: { valor: "12% em relação ao mês anterior", tendencia: "sobe" },
  },
  {
    id: "recebidos",
    rotulo: "Pagamentos Recebidos",
    valor: "R$ 42.380,00",
    icone: "cifrao",
    variacao: { valor: "15% em relação ao mês anterior", tendencia: "sobe" },
  },
  {
    id: "pagos",
    rotulo: "Agendamentos Pagos",
    valor: "842",
    icone: "calendarioCheck",
    variacao: { valor: "8% em relação ao mês anterior", tendencia: "sobe" },
  },
  {
    id: "pendentes",
    rotulo: "Pendentes",
    valor: "R$ 6.370,00",
    icone: "relogio",
    tom: "amarelo",
    variacao: { valor: "3% do total", tendencia: "alerta" },
  },
];

/** Evolução dos últimos 7 dias — duas séries. */
export const evolucaoFinanceira = {
  escalaMaxima: 10000,
  passo: 2000,
  rotulos: ["09/09", "10/09", "11/09", "12/09", "13/09", "14/09", "15/09"],
  series: [
    {
      id: "receita",
      rotulo: "Receita",
      cor: "#0066FF",
      valores: [4300, 3900, 5100, 5000, 3950, 4900, 4850],
    },
    {
      id: "pagamento",
      rotulo: "Pagamento",
      cor: "#7FB2FF",
      valores: [2600, 2250, 3400, 2700, 2200, 3100, 3350],
    },
  ],
};

export const formasPagamento = {
  total: "R$ 42.380,00",
  descricao: "Total recebido",
  fatias: [
    { id: "credito", rotulo: "Cartão de Crédito", percentual: 45, cor: "#5B9BFF" },
    { id: "pix", rotulo: "Pix", percentual: 30, cor: "#14B8A6" },
    { id: "boleto", rotulo: "Boleto", percentual: 15, cor: "#0066FF" },
    { id: "dinheiro", rotulo: "Dinheiro", percentual: 7, cor: "#F59E0B" },
    { id: "outros", rotulo: "Outros", percentual: 3, cor: "#A855F7" },
  ],
};

export const statusTransacao = {
  pago: { rotulo: "Pago", variante: "sucesso" },
  pendente: { rotulo: "Pendente", variante: "aviso" },
  estornado: { rotulo: "Estornado", variante: "erro" },
};

export const transacoes = [
  {
    id: 1,
    dataHora: "15/09/2026 10:24",
    descricao: "Consulta médica",
    paciente: "Maria Silva",
    forma: "Pix",
    valor: "R$ 120,00",
    status: "pago",
  },
  {
    id: 2,
    dataHora: "15/09/2026 09:50",
    descricao: "Exame laboratorial",
    paciente: "João Santos",
    forma: "Cartão de Crédito",
    valor: "R$ 85,00",
    status: "pago",
  },
  {
    id: 3,
    dataHora: "14/09/2026 16:32",
    descricao: "Consulta médica",
    paciente: "Ana Costa",
    forma: "Boleto",
    valor: "R$ 150,00",
    status: "pago",
  },
  {
    id: 4,
    dataHora: "14/09/2026 14:10",
    descricao: "Retorno",
    paciente: "Carlos Oliveira",
    forma: "Pix",
    valor: "R$ 90,00",
    status: "pago",
  },
  {
    id: 5,
    dataHora: "14/09/2026 11:47",
    descricao: "Consulta médica",
    paciente: "Juliana Pereira",
    forma: "Dinheiro",
    valor: "R$ 100,00",
    status: "pago",
  },
  {
    id: 6,
    dataHora: "13/09/2026 15:05",
    descricao: "Exame de imagem",
    paciente: "Roberto Almeida",
    forma: "Cartão de Crédito",
    valor: "R$ 240,00",
    status: "pendente",
  },
  {
    id: 7,
    dataHora: "13/09/2026 09:12",
    descricao: "Consulta médica",
    paciente: "Fernanda Rocha",
    forma: "Pix",
    valor: "R$ 120,00",
    status: "pago",
  },
  {
    id: 8,
    dataHora: "12/09/2026 17:40",
    descricao: "Exame laboratorial",
    paciente: "Lucas Almeida",
    forma: "Boleto",
    valor: "R$ 85,00",
    status: "estornado",
  },
];

export const acoesRapidas = [
  {
    id: "relatorio",
    titulo: "Gerar Relatório Financeiro",
    descricao: "Baixe relatórios em PDF ou Excel.",
    icone: "documento",
  },
  {
    id: "convenios",
    titulo: "Gerenciar Convênios",
    descricao: "Configure e acompanhe os convênios ativos.",
    icone: "aperto",
  },
  {
    id: "formas",
    titulo: "Configurar Formas de Pagamento",
    descricao: "Ative ou desative métodos de pagamento.",
    icone: "cartao",
  },
  {
    id: "nota",
    titulo: "Emitir Nota Fiscal",
    descricao: "Gere notas fiscais dos atendimentos.",
    icone: "documento",
  },
];

export const opcoesPeriodoFinanceiro = [
  { valor: "7d", rotulo: "Últimos 7 dias" },
  { valor: "15d", rotulo: "Últimos 15 dias" },
  { valor: "30d", rotulo: "Últimos 30 dias" },
];
