// Adaptadores que convertem as respostas da API para o formato das telas
// (features/paciente/adaptadores.js e features/admin/adaptadores.js). Os
// modelos dos cartões são os próprios mocks, como em AdminConectado.jsx.
import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { createServer } from 'vite'

// Datas e horas formatadas dependem do fuso de quem roda o teste.
process.env.TZ = 'America/Sao_Paulo'

let server
let paciente
let admin
const modelos = {}

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  const carregar = (caminho) => server.ssrLoadModule(caminho)
  paciente = await carregar('/src/features/paciente/adaptadores.js')
  admin = await carregar('/src/features/admin/adaptadores.js')
  modelos.dashboard = await carregar('/src/services/dadosAdminDashboard.js')
  modelos.financeiro = await carregar('/src/services/dadosAdminFinanceiro.js')
  modelos.relatorios = await carregar('/src/services/dadosAdminRelatorios.js')
  modelos.usuarios = (await carregar('/src/services/dadosAdminUsuarios.js')).metricas
})

after(async () => { await server?.close() })

const porId = (lista) => Object.fromEntries(lista.map((item) => [item.id, item]))

describe('paciente', () => {
  test('consulta leva os ids que as ações usam', () => {
    const c = paciente.paraConsulta({
      id: 'a1', inicio: '2026-10-01T10:00:00', status: 'confirmada', podeAlterar: true,
      unidade: { nome: 'Clínica Centro', endereco: 'Rua A, 1' },
      especialidade: { id: 'e1', nome: 'Cardiologia' }, medico: { id: 'm1', nome: 'Dr. X' },
    })
    assert.deepEqual(c, {
      id: 'a1', dateTime: '2026-10-01T10:00:00', clinic: 'Clínica Centro', address: 'Rua A, 1',
      specialty: 'Cardiologia', professional: 'Dr. X', status: 'confirmada', podeAlterar: true,
      medicoId: 'm1', especialidadeId: 'e1',
    })
  })

  test('unidade ausente vira null; campos opcionais viram vazio', () => {
    assert.equal(paciente.paraUnidade(null), null)
    assert.deepEqual(paciente.paraUnidade({ nome: 'U', endereco: 'E' }), {
      name: 'U', address: 'E', phone: '', hours: '', mapUrl: '#',
    })
  })

  test('exame sem data usa o prazo ao meio-dia; em_analise ganha o rótulo da tela', () => {
    const e = paciente.paraExame({
      id: 'x1', dataHora: null, prazo: '2026-10-05', nome: 'Hemograma', categoria: 'Sangue',
      unidade: null, medico: null, status: 'em_analise', resultadoDisponivel: false, preparo: 'Jejum',
    })
    assert.equal(e.dateTime, '2026-10-05T12:00:00')
    assert.equal(e.status, 'em análise')
    assert.equal(e.clinic, 'A definir')
    assert.equal(e.professional, '')
    assert.equal(e.resultUrl, null)
  })

  test('exame sem data nem prazo fica sem data, e status desconhecido passa como está', () => {
    const e = paciente.paraExame({ id: 'x2', nome: 'RX', status: 'novo_status' })
    assert.equal(e.dateTime, null)
    assert.equal(e.status, 'novo_status')
  })

  test('atendimento sem resumo não vira "undefined"', () => {
    const a = paciente.paraAtendimento({ id: 'h1', inicio: '2026-09-01T09:00:00', unidade: 'U', especialidade: 'E', medico: 'M', desfecho: 'Alta' })
    assert.equal(a.summary, '')
    assert.equal(a.outcome, 'Alta')
  })
})

describe('admin: cartões e listas', () => {
  test('variação: sobe, desce, estável e sem base de comparação', () => {
    const [modelo] = modelos.usuarios
    const variacaoCom = (valor, anterior) => admin.cartoes([modelo], { [modelo.id]: { valor, anterior } })[0].variacao
    assert.deepEqual(variacaoCom(150, 100), { valor: '50%', tendencia: 'sobe' })
    assert.deepEqual(variacaoCom(75, 100), { valor: '25%', tendencia: 'desce' })
    assert.deepEqual(variacaoCom(100, 100), { valor: '0%', tendencia: 'neutra' })
    assert.deepEqual(variacaoCom(0, 0), { valor: '0%', tendencia: 'neutra' })
    // De 0 para algo não há percentual que faça sentido.
    assert.equal(variacaoCom(5, 0), undefined)
    assert.equal(variacaoCom(5, undefined), undefined)
  })

  test('cartão sem valor na resposta mostra "—" e mantém rótulo e ícone do modelo', () => {
    const [modelo] = modelos.usuarios
    const [cartao] = admin.cartoes([modelo], {})
    assert.equal(cartao.valor, '—')
    assert.equal(cartao.rotulo, modelo.rotulo)
    assert.equal(cartao.icone, modelo.icone)
  })

  test('números saem no formato brasileiro', () => {
    const [modelo] = modelos.usuarios
    assert.equal(admin.cartoes([modelo], { [modelo.id]: { valor: 12345 } })[0].valor, '12.345')
  })

  test('usuário: médico mostra as especialidades; papel desconhecido não quebra', () => {
    const base = { id: 'u1', nome: 'Ana', email: 'a@x', status: 'ativo', fotoUrl: '/f.jpg' }
    const medico = admin.paraUsuario({ ...base, papel: 'MEDICO', medico: { especialidades: [{ nome: 'Pediatria' }] } })
    assert.equal(medico.cargo, 'Pediatria')
    assert.equal(medico.perfil, 'medico')
    assert.equal(medico.ultimoAcesso, 'Nunca acessou')
    assert.equal(medico.cpf, '—')
    const outro = admin.paraUsuario({ ...base, papel: 'AUDITOR' })
    assert.equal(outro.cargo, 'AUDITOR')
    assert.equal(outro.perfil, 'paciente')
  })

  test('agendamento: data local, sem deslocar o dia', () => {
    const a = admin.paraAgendamento({
      id: 'g1', data: '2026-09-01', horario: '08:00', especialidade: 'Cardiologia', status: 'pendente', tipo: 'consulta',
      paciente: { nome: 'Ana', cpf: null, fotoUrl: '/f.jpg' }, medico: { nome: 'Dr. X', crm: '1-RJ' },
      unidade: { nome: 'Centro', bairro: null },
    })
    assert.equal(a.data, '01/09/2026')
    assert.equal(a.cpf, '—')
    assert.equal(a.bairro, '')
  })

  test('calendário: só os tipos com contagem', () => {
    assert.deepEqual(admin.paraMarcacoes({ dias: { 3: { consultas: 2, exames: 0, retornos: 1, cancelados: 0 }, 4: { consultas: 0 } } }), {
      3: ['consultas', 'retornos'], 4: [],
    })
  })

  test('opções de filtro: sem repetidos nem vazios, em ordem alfabética, "todos" primeiro', () => {
    const opcoes = admin.opcoesDe([{ u: 'Óbidos' }, { u: 'Centro' }, { u: 'Centro' }, { u: null }], 'u', 'Todas', 'todas')
    assert.deepEqual(opcoes.map((o) => o.valor), ['todas', 'Centro', 'Óbidos'])
  })

  test('período do gráfico: "6m" vira 6; inválido cai em 9', () => {
    assert.equal(admin.mesesDoPeriodo('6m'), 6)
    assert.equal(admin.mesesDoPeriodo('x'), 9)
  })
})

describe('admin: dashboard', () => {
  const DASHBOARD = {
    metricas: {
      usuariosCadastrados: 40, novosUsuarios: { atual: 3, anterior: 2 }, agendamentos: { atual: 12, anterior: 10 },
      clinicasAtivas: 5, exames: { atual: 4, anterior: 0 }, cancelamentos: { atual: 1, anterior: 2 },
    },
    agendamentosPorMes: [{ mes: '2026-08', total: 2230 }, { mes: '2026-09', total: 900 }],
    tiposDeAtendimento: { consultas: 6, retornos: 1, exames: 3 },
    clinicasMaisAcessadas: [{ id: 'c1', nome: 'Centro', endereco: 'Rua A', status: 'ativa', agendamentos: 7 }],
    ultimosAgendamentos: [{
      id: 'g1', data: '2026-09-28', horario: '10:40', especialidade: 'Clínica', status: 'confirmada', tipo: 'consulta',
      descricao: 'Consulta de rotina', paciente: { nome: 'Ana', fotoUrl: '/f.jpg' }, medico: { nome: 'Dr. X', crm: '1' },
      unidade: { nome: 'Centro', bairro: 'Centro' },
    }],
    notificacoes: [{ id: 'n1', titulo: 'T', detalhe: null, quando: 'Hoje', tipo: 'desconhecido' }],
  }

  test('monta cartões, gráfico, tipos, últimos agendamentos e notificações', () => {
    const d = admin.paraDashboard(modelos.dashboard, DASHBOARD)
    const cartoes = porId(d.metricas)
    assert.equal(cartoes.usuarios.valor, '40')
    assert.deepEqual(cartoes.agendamentos.variacao, { valor: '20%', tendencia: 'sobe' })
    assert.equal(cartoes.exames.variacao, undefined)

    assert.equal(d.agendamentosPorMes.escalaMaxima, 2500)
    assert.equal(d.agendamentosPorMes.passo, 500)
    assert.deepEqual(d.agendamentosPorMes.dados, [{ rotulo: 'Ago', valor: 2230 }, { rotulo: 'Set', valor: 900 }])

    assert.equal(d.tiposAtendimento.total, '10')
    assert.deepEqual(d.tiposAtendimento.fatias.map((f) => f.percentual), [60, 30, 10])

    assert.deepEqual(d.ultimosAgendamentos[0], {
      id: 'g1', paciente: 'Ana', tipo: 'Consulta de rotina', medico: 'Dr. X', data: '28/09', hora: '10:40',
      status: 'confirmada', foto: '/f.jpg',
    })
    assert.deepEqual(d.notificacoes[0], { id: 'n1', titulo: 'T', descricao: '', tempo: 'Hoje', tipo: 'info' })
  })

  test('sem movimento: escala mínima e percentuais zerados, sem dividir por zero', () => {
    const d = admin.paraDashboard(modelos.dashboard, {
      ...DASHBOARD,
      agendamentosPorMes: [{ mes: '2026-09', total: 0 }],
      tiposDeAtendimento: { consultas: 0, retornos: 0, exames: 0 },
    })
    assert.equal(d.agendamentosPorMes.escalaMaxima, 10)
    assert.equal(d.agendamentosPorMes.passo, 2)
    assert.deepEqual(d.tiposAtendimento.fatias.map((f) => f.percentual), [0, 0, 0])
  })

  test('escala com passo inteiro para valores pequenos', () => {
    for (const total of [1, 7, 10]) {
      const d = admin.paraDashboard(modelos.dashboard, { ...DASHBOARD, agendamentosPorMes: [{ mes: '2026-09', total }] })
      assert.deepEqual([d.agendamentosPorMes.escalaMaxima, d.agendamentosPorMes.passo], [10, 2], `total ${total}`)
    }
  })
})

describe('admin: financeiro', () => {
  const RESUMO = {
    de: '2026-09-22', ate: '2026-09-28',
    faturado: { atual: 1800, anterior: 1200 },
    recebido: { atual: '600.00', anterior: '0.00' },
    pagamentos: { atual: 4, anterior: 3 },
    consultasPagas: { atual: 4, anterior: 4 },
    emAberto: 1200, cobrancasEmAberto: 8, estornado: 0,
    porForma: [{ forma: 'pix', rotulo: 'Pix', total: 300, percentual: 50 }, { forma: 'cheque', total: 300, percentual: 50 }],
    evolucao: [{ data: '2026-09-27', faturado: 3, recebido: 0 }, { data: '2026-09-28', faturado: '1797.00', recebido: 600 }],
  }

  test('cartões em reais, com variação longa e o alerta de cobranças em aberto', () => {
    const f = admin.paraFinanceiro(modelos.financeiro, RESUMO)
    const cartoes = porId(f.metricas)
    assert.match(cartoes.receita.valor, /^R\$\s1\.800,00$/)
    assert.deepEqual(cartoes.receita.variacao, { valor: '50% em relação ao período anterior', tendencia: 'sobe' })
    // Valores vêm como string do Jackson (BigDecimal): precisam virar número.
    assert.match(cartoes.recebidos.valor, /^R\$\s600,00$/)
    assert.equal(cartoes.recebidos.variacao, undefined)
    assert.equal(cartoes.pagos.variacao.tendencia, 'neutra')
    assert.deepEqual(cartoes.pendentes.variacao, { valor: '8 cobrança(s) em aberto', tendencia: 'alerta' })
  })

  test('evolução em dd/mm, com as duas séries renomeadas e escala arredondada', () => {
    const { evolucaoFinanceira: e } = admin.paraFinanceiro(modelos.financeiro, RESUMO)
    assert.deepEqual(e.rotulos, ['27/09', '28/09'])
    assert.deepEqual(e.series.map((s) => s.rotulo), ['Faturado', 'Recebido'])
    assert.deepEqual(e.series[0].valores, [3, 1797])
    assert.equal(e.escalaMaxima, 2000)
  })

  test('forma de pagamento desconhecida ganha cor neutra e o nome cru', () => {
    const { formasPagamento: p } = admin.paraFinanceiro(modelos.financeiro, RESUMO)
    assert.equal(p.fatias[1].cor, '#94A3B8')
    assert.equal(p.fatias[1].rotulo, 'cheque')
    assert.equal(p.fatias[0].rotulo, 'Pix')
  })

  test('transação: data do pagamento quando paga, forma com rótulo, "—" sem forma', () => {
    const base = { id: 't1', descricao: 'Consulta', valor: '150.00', paciente: { nome: 'Ana' } }
    const paga = admin.paraTransacao({ ...base, dataHora: '2026-09-27T13:00:00Z', pagoEm: '2026-09-28T13:30:00Z', forma: 'credito', status: 'pago' })
    assert.equal(paga.dataHora, '28/09/2026 10:30')
    assert.equal(paga.forma, 'Cartão de Crédito')
    assert.match(paga.valor, /^R\$\s150,00$/)
    const pendente = admin.paraTransacao({ ...base, dataHora: '2026-09-27T13:00:00Z', pagoEm: null, forma: null, paciente: null, status: 'pendente' })
    assert.equal(pendente.dataHora, '27/09/2026 10:00')
    assert.equal(pendente.forma, '—')
    assert.equal(pendente.paciente, '—')
  })
})

describe('admin: relatórios', () => {
  const zero = { agendamentos: 0, atendimentos: 0, pacientes: 0, cancelamentos: 0, faltas: 0 }
  const RESUMO = {
    totais: { agendamentos: 20, atendimentos: 12, pacientes: 9, cancelamentos: 2, faltas: 1 },
    anterior: { agendamentos: 10, atendimentos: 12, pacientes: 0, cancelamentos: 4, faltas: 0 },
    porTipo: { consultas: 14, retornos: 3, exames: 5 },
    porEspecialidade: [
      { rotulo: 'A', total: 40 }, { rotulo: 'B', total: 20 }, { rotulo: 'C', total: 15 },
      { rotulo: 'D', total: 10 }, { rotulo: 'E', total: 10 }, { rotulo: 'F', total: 5 },
    ],
    porUnidade: [{ rotulo: 'Centro', total: 1245 }],
    porProfissional: [],
    evolucao: [{ rotulo: '01/09', periodo: '2026-09-01', total: 3 }],
    faixaEtaria: [{ rotulo: '0–18', total: 1 }, { rotulo: '19–30', total: 3 }],
  }

  test('cartões comparam com o período anterior; "espera" fica em "—"', () => {
    const r = admin.paraRelatorios(modelos.relatorios, RESUMO)
    const cartoes = porId(r.metricas)
    assert.deepEqual(cartoes.agendamentos.variacao, { valor: '100%', tendencia: 'sobe' })
    assert.deepEqual(cartoes.atendimentos.variacao, { valor: '0%', tendencia: 'neutra' })
    assert.deepEqual(cartoes.cancelamentos.variacao, { valor: '50%', tendencia: 'desce' })
    assert.equal(cartoes.pacientes.variacao, undefined)
    assert.equal(cartoes.espera.valor, '—')
  })

  test('mais de 5 especialidades: 4 fatias e o resto em "Outras"', () => {
    const { porEspecialidade: p } = admin.paraRelatorios(modelos.relatorios, RESUMO)
    assert.equal(p.total, '100')
    assert.deepEqual(p.fatias.map((f) => [f.rotulo, f.percentual]), [['A', 40], ['B', 20], ['C', 15], ['D', 10], ['Outras', 15]])
    assert.ok(p.fatias.every((f) => f.cor))
  })

  test('até 5 especialidades: todas aparecem, sem "Outras"', () => {
    const r = admin.paraRelatorios(modelos.relatorios, { ...RESUMO, porEspecialidade: RESUMO.porEspecialidade.slice(0, 5) })
    assert.deepEqual(r.porEspecialidade.fatias.map((f) => f.rotulo), ['A', 'B', 'C', 'D', 'E'])
  })

  test('faixa etária em percentual; resumo com o líder por unidade e rótulo padrão sem profissional', () => {
    const r = admin.paraRelatorios(modelos.relatorios, RESUMO)
    assert.deepEqual(r.porFaixaEtaria, [{ rotulo: '0–18', percentual: 25 }, { rotulo: '19–30', percentual: 75 }])
    const resumo = porId(r.resumoPeriodo)
    assert.equal(resumo.unidade.rotulo, 'Mais atendimentos: Centro')
    assert.equal(resumo.unidade.valor, '1.245')
    assert.equal(resumo.profissional.rotulo, 'Atendimentos por profissional')
    assert.equal(resumo.profissional.valor, '0')
    assert.equal(resumo.consultas.valor, '14')
  })

  test('período vazio não quebra nem divide por zero', () => {
    const r = admin.paraRelatorios(modelos.relatorios, {
      totais: zero, anterior: zero, porTipo: { consultas: 0, retornos: 0, exames: 0 },
      porEspecialidade: [], porUnidade: [], porProfissional: [], evolucao: [], faixaEtaria: [{ rotulo: '0–18', total: 0 }],
    })
    assert.deepEqual(r.porEspecialidade.fatias, [])
    assert.equal(r.porEspecialidade.total, '0')
    assert.equal(r.evolucaoAtendimentos.escalaMaxima, 10)
    assert.deepEqual(r.porFaixaEtaria, [{ rotulo: '0–18', percentual: 0 }])
  })
})
