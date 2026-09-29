/* Converte as respostas de /api/admin/* para o formato que as telas do admin
   já recebiam dos mocks (services/dadosAdmin*.js). Textos fixos dos cartões
   (rótulo, ícone, nota) continuam nos mocks; daqui só saem os números. */

import { fotoDoPaciente } from "../../services/fotosPacientes";

const numero = new Intl.NumberFormat("pt-BR");
const dataCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dataHora = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Variação percentual entre dois meses, no formato dos cartões. */
function variacao(atual, anterior) {
  if (anterior == null) return undefined;
  if (anterior === 0) return atual === 0 ? { valor: "0%", tendencia: "neutra" } : undefined;
  const pct = Math.round(((atual - anterior) / anterior) * 100);
  return { valor: `${Math.abs(pct)}%`, tendencia: pct > 0 ? "sobe" : pct < 0 ? "desce" : "neutra" };
}

/**
 * Cartões de métrica: pega os modelos do mock (rótulo, ícone, nota, tom) e
 * troca `valor` e `variacao` pelos números reais.
 * `valores`: { idDoCartao: { valor, anterior? } }.
 */
export function cartoes(modelos, valores) {
  return modelos.map((modelo) => {
    const v = valores[modelo.id];
    if (!v) return { ...modelo, valor: "—", variacao: undefined };
    return { ...modelo, valor: numero.format(v.valor), variacao: variacao(v.valor, v.anterior) };
  });
}

/* ------------------------------------------------------------ usuários */

/** Papel da API → chave de `perfisUsuario` do mock. */
export const PERFIL_POR_PAPEL = {
  PACIENTE: "paciente",
  MEDICO: "medico",
  ENFERMEIRO: "enfermeiro",
  ADMIN: "administrador",
  AGENTE: "agente",
  RECEPCIONISTA: "recepcionista",
  GESTOR: "gestor",
};

const CARGO_POR_PAPEL = {
  PACIENTE: "Paciente",
  MEDICO: "Médico(a)",
  ENFERMEIRO: "Enfermeiro(a)",
  ADMIN: "Administrador(a)",
  AGENTE: "Agente comunitário",
  RECEPCIONISTA: "Recepcionista",
  GESTOR: "Gestor(a)",
};

export function paraUsuario(u) {
  const especialidades = u.medico?.especialidades?.map((e) => e.nome).join(", ");
  return {
    id: u.id,
    nome: u.nome,
    cargo: especialidades || CARGO_POR_PAPEL[u.papel] || u.papel,
    cpf: u.cpf ?? "—",
    email: u.email,
    telefone: u.telefone ?? "—",
    perfil: PERFIL_POR_PAPEL[u.papel] ?? "paciente",
    papel: u.papel,
    status: u.status,
    ultimoAcesso: u.ultimoAcesso ? dataHora.format(new Date(u.ultimoAcesso)).replace(",", "") : "Nunca acessou",
    foto: u.fotoUrl ?? fotoDoPaciente(u.nome),
  };
}

export function metricasDeUsuarios(modelos, m) {
  return cartoes(modelos, {
    total: { valor: m.total },
    ativos: { valor: m.ativos },
    novos: { valor: m.novosNoMes, anterior: m.novosNoMesAnterior },
    bloqueados: { valor: m.bloqueados },
  });
}

/* ------------------------------------------------------------ clínicas */

export function paraClinica(u) {
  return {
    id: u.id,
    nome: u.nome,
    especialidade: u.especialidades.length ? u.especialidades.join(", ") : "Sem médicos vinculados",
    endereco: u.bairro ? `${u.endereco} – ${u.bairro}` : u.endereco,
    municipio: `${u.cidade} - ${u.uf}`,
    telefone: u.telefone ?? "—",
    status: u.status,
  };
}

export function metricasDeClinicas(modelos, m) {
  return cartoes(modelos, {
    total: { valor: m.total },
    ativas: { valor: m.ativas },
    manutencao: { valor: m.manutencao },
    inativas: { valor: m.inativas },
  });
}

/** Opções de filtro a partir dos próprios dados (o primeiro item é "todos"). */
export function opcoesDe(itens, campo, rotuloTodos, valorTodos = "todos") {
  const valores = [...new Set(itens.map((item) => item[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return [{ valor: valorTodos, rotulo: rotuloTodos }, ...valores.map((v) => ({ valor: v, rotulo: v }))];
}

/* ------------------------------------------------------------ agendamentos */

export function paraAgendamento(a) {
  const [ano, mes, dia] = a.data.split("-").map(Number);
  return {
    id: a.id,
    data: dataCurta.format(new Date(ano, mes - 1, dia)),
    dataIso: a.data,
    hora: a.horario,
    paciente: a.paciente.nome,
    foto: a.paciente.fotoUrl ?? fotoDoPaciente(a.paciente.nome),
    cpf: a.paciente.cpf ?? "—",
    especialidade: a.especialidade,
    profissional: a.medico.nome,
    crm: a.medico.crm,
    unidade: a.unidade.nome,
    bairro: a.unidade.bairro ?? "",
    status: a.status,
    tipo: a.tipo,
  };
}

export function metricasDeAgendamentos(modelos, m) {
  const s = m.porStatus;
  return cartoes(modelos, {
    total: { valor: m.total },
    confirmados: { valor: (s.confirmada ?? 0) + (s.aguardando ?? 0) + (s.em_andamento ?? 0) + (s.realizada ?? 0) },
    espera: { valor: s.pendente ?? 0 },
    cancelados: { valor: (s.cancelada ?? 0) + (s.faltou ?? 0) },
  });
}

/** Calendário da API → `{ dia: ["consultas", "exames"...] }` do componente Calendario. */
export function paraMarcacoes(calendario) {
  const tipos = ["consultas", "exames", "retornos", "cancelados"];
  return Object.fromEntries(
    Object.entries(calendario.dias).map(([dia, contagem]) => [dia, tipos.filter((t) => contagem[t] > 0)]),
  );
}

/* ------------------------------------------------------------ dashboard */

/** Topo arredondado do eixo (ex.: 2230 → 2500) e o passo das linhas de grade. */
function escala(maximo) {
  if (maximo <= 10) return { escalaMaxima: 10, passo: 2 };
  const magnitude = 10 ** Math.floor(Math.log10(maximo));
  const topo = Math.ceil(maximo / (magnitude / 2)) * (magnitude / 2);
  return { escalaMaxima: topo, passo: topo / 5 };
}

const TIPO_DE_NOTIFICACAO = { resultado: "sucesso", cancelamento: "erro", agendamento: "info", retorno: "aviso", sistema: "info" };

export function paraDashboard(modelos, d) {
  const m = d.metricas;
  const pontos = d.agendamentosPorMes.map((p) => ({ rotulo: MESES[Number(p.mes.slice(5, 7)) - 1], valor: p.total }));
  const t = d.tiposDeAtendimento;
  const totalTipos = t.consultas + t.retornos + t.exames;
  const percentual = (v) => (totalTipos ? Math.round((v / totalTipos) * 100) : 0);
  return {
    metricas: cartoes(modelos.metricas, {
      usuarios: { valor: m.usuariosCadastrados },
      agendamentos: { valor: m.agendamentos.atual, anterior: m.agendamentos.anterior },
      clinicas: { valor: m.clinicasAtivas },
      exames: { valor: m.exames.atual, anterior: m.exames.anterior },
      cancelamentos: { valor: m.cancelamentos.atual, anterior: m.cancelamentos.anterior },
    }),
    agendamentosPorMes: { ...escala(Math.max(0, ...pontos.map((p) => p.valor))), dados: pontos },
    tiposAtendimento: {
      ...modelos.tiposAtendimento,
      total: numero.format(totalTipos),
      fatias: [
        { ...modelos.tiposAtendimento.fatias[0], percentual: percentual(t.consultas) },
        { ...modelos.tiposAtendimento.fatias[1], percentual: percentual(t.exames) },
        { ...modelos.tiposAtendimento.fatias[2], percentual: percentual(t.retornos) },
      ],
    },
    clinicasMaisAcessadas: d.clinicasMaisAcessadas.map((c) => ({
      id: c.id,
      nome: c.nome,
      endereco: c.endereco,
      agendamentos: c.agendamentos,
      status: c.status,
    })),
    ultimosAgendamentos: d.ultimosAgendamentos.map((a) => {
      const linha = paraAgendamento(a);
      return {
        id: a.id,
        paciente: linha.paciente,
        tipo: a.descricao,
        medico: linha.profissional,
        data: linha.data.slice(0, 5),
        hora: linha.hora,
        status: a.status,
        foto: linha.foto,
      };
    }),
    notificacoes: d.notificacoes.map((n) => ({
      id: n.id,
      titulo: n.titulo,
      descricao: n.detalhe ?? "",
      tempo: n.quando,
      tipo: TIPO_DE_NOTIFICACAO[n.tipo] ?? "info",
    })),
  };
}

/** Período do seletor do gráfico ("9m") → meses para a API. */
export function mesesDoPeriodo(periodo) {
  return Number.parseInt(periodo, 10) || 9;
}

/* ------------------------------------------------------------ financeiro */

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const diaMes = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Mesma ideia de `variacao`, com o texto longo dos cartões do financeiro. */
function variacaoLonga(atual, anterior) {
  const v = variacao(Number(atual), Number(anterior));
  return v && { ...v, valor: `${v.valor} em relação ao período anterior` };
}

const ROTULO_DA_FORMA = {
  credito: "Cartão de Crédito",
  debito: "Cartão de Débito",
  pix: "Pix",
  boleto: "Boleto",
  dinheiro: "Dinheiro",
  convenio: "Convênio",
};
const COR_DA_FORMA = {
  credito: "#5B9BFF",
  debito: "#7FB2FF",
  pix: "#14B8A6",
  boleto: "#0066FF",
  dinheiro: "#F59E0B",
  convenio: "#A855F7",
};

export function paraTransacao(t) {
  return {
    id: t.id,
    dataHora: dataHora.format(new Date(t.pagoEm ?? t.dataHora)).replace(",", ""),
    descricao: t.descricao,
    paciente: t.paciente?.nome ?? "—",
    forma: t.forma ? ROTULO_DA_FORMA[t.forma] ?? t.forma : "—",
    valor: moeda.format(Number(t.valor)),
    status: t.status,
  };
}

/** Resumo de /financeiro/resumo → cartões, gráfico de evolução e pizza de formas. */
export function paraFinanceiro(modelos, r) {
  const valores = {
    receita: { valor: moeda.format(Number(r.faturado.atual)), variacao: variacaoLonga(r.faturado.atual, r.faturado.anterior) },
    recebidos: { valor: moeda.format(Number(r.recebido.atual)), variacao: variacaoLonga(r.recebido.atual, r.recebido.anterior) },
    pagos: {
      valor: numero.format(r.consultasPagas.atual),
      variacao: variacaoLonga(r.consultasPagas.atual, r.consultasPagas.anterior),
    },
    pendentes: {
      valor: moeda.format(Number(r.emAberto)),
      variacao: { valor: `${numero.format(r.cobrancasEmAberto)} cobrança(s) em aberto`, tendencia: "alerta" },
    },
  };
  const maximo = Math.max(0, ...r.evolucao.flatMap((d) => [Number(d.faturado), Number(d.recebido)]));
  const [serieFaturado, serieRecebido] = modelos.evolucaoFinanceira.series;
  return {
    metricas: modelos.metricas.map((m) => ({ ...m, ...(valores[m.id] ?? { valor: "—", variacao: undefined }) })),
    evolucaoFinanceira: {
      ...escala(maximo),
      rotulos: r.evolucao.map((d) => diaMes(d.data)),
      series: [
        { ...serieFaturado, rotulo: "Faturado", valores: r.evolucao.map((d) => Number(d.faturado)) },
        { ...serieRecebido, rotulo: "Recebido", valores: r.evolucao.map((d) => Number(d.recebido)) },
      ],
    },
    formasPagamento: {
      total: moeda.format(Number(r.recebido.atual)),
      descricao: "Total recebido",
      fatias: r.porForma.map((f) => ({
        id: f.forma,
        rotulo: f.rotulo ?? ROTULO_DA_FORMA[f.forma] ?? f.forma,
        percentual: f.percentual,
        cor: COR_DA_FORMA[f.forma] ?? "#94A3B8",
      })),
    },
  };
}

/* ------------------------------------------------------------ relatórios */

const CORES_DAS_FATIAS = ["var(--azul)", "var(--azul-suave)", "var(--verde-claro)", "var(--roxo)", "#c4b5fd"];

/** Até 4 fatias e o resto somado em "Outras", como no mock. */
function fatias(itens) {
  const total = itens.reduce((soma, i) => soma + i.total, 0);
  const principais = itens.length > 5 ? itens.slice(0, 4) : itens;
  const resto = itens.length > 5 ? itens.slice(4).reduce((soma, i) => soma + i.total, 0) : 0;
  const lista = resto ? [...principais, { rotulo: "Outras", total: resto }] : principais;
  return lista.map((i, n) => ({
    id: i.rotulo,
    rotulo: i.rotulo,
    percentual: total ? Math.round((i.total / total) * 100) : 0,
    cor: CORES_DAS_FATIAS[n],
  }));
}

/** Resumo de /relatorios/resumo → tudo o que a tela de relatórios mostra. */
export function paraRelatorios(modelos, r) {
  const t = r.totais;
  const a = r.anterior;
  const totalEspecialidades = r.porEspecialidade.reduce((soma, i) => soma + i.total, 0);
  const totalFaixas = r.faixaEtaria.reduce((soma, i) => soma + i.total, 0);
  const maisAtendimentos = (itens) => (itens.length ? itens[0].total : 0);
  const resumo = {
    unidade: maisAtendimentos(r.porUnidade),
    profissional: maisAtendimentos(r.porProfissional),
    consultas: r.porTipo.consultas,
    exames: r.porTipo.exames,
    retornos: r.porTipo.retornos,
  };
  return {
    metricas: cartoes(modelos.metricas, {
      atendimentos: { valor: t.atendimentos, anterior: a.atendimentos },
      agendamentos: { valor: t.agendamentos, anterior: a.agendamentos },
      pacientes: { valor: t.pacientes, anterior: a.pacientes },
      cancelamentos: { valor: t.cancelamentos, anterior: a.cancelamentos },
    }),
    porEspecialidade: {
      total: numero.format(totalEspecialidades),
      descricao: "atendimentos",
      fatias: fatias(r.porEspecialidade),
    },
    evolucaoAtendimentos: {
      ...escala(Math.max(0, ...r.evolucao.map((p) => p.total))),
      dados: r.evolucao.map((p) => ({ rotulo: p.rotulo, valor: p.total })),
    },
    porFaixaEtaria: r.faixaEtaria.map((f) => ({
      rotulo: f.rotulo,
      percentual: totalFaixas ? Math.round((f.total / totalFaixas) * 100) : 0,
    })),
    resumoPeriodo: modelos.resumoPeriodo.map((m) => ({
      ...m,
      rotulo: m.id === "unidade" && r.porUnidade.length ? `Mais atendimentos: ${r.porUnidade[0].rotulo}`
        : m.id === "profissional" && r.porProfissional.length ? `Mais atendimentos: ${r.porProfissional[0].rotulo}`
          : m.rotulo,
      valor: numero.format(resumo[m.id] ?? 0),
    })),
  };
}
