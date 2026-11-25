import { apiFalsa, carregar, clicar, createElement, digitar, encerrar, esperar, limpar, porTexto, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

let Dashboard, AuthContext, hojeNaClinica
before(async () => {
  Dashboard = (await carregar('/src/features/clinicas/pages/DashboardDaUnidade.jsx')).default
  ;({ AuthContext } = await carregar('/src/features/auth/auth.context.js'))
  ;({ hojeNaClinica } = await carregar('/src/features/clinicas/painelDaUnidade.js'))
})
afterEach(limpar)
after(encerrar)

const unidade = {
  id: 'u1', nome: 'Centro', endereco: 'Rua da Clínica', cidade: 'Saquarema', uf: 'RJ',
  especialidades: ['Clínica Geral'], status: 'ativa', medicos: 2, agendamentosNoMes: 15,
}
const consulta = (id, nome, status, horario = '09:00') => ({
  id, horario, status, paciente: { nome }, medico: { id: 'm1', nome: 'Médica Teste' }, especialidade: 'Clínica Geral',
})
const montar = (data = '2026-11-10') => renderizar(createElement(AuthContext.Provider, {
  value: { usuario: { nomeCompleto: 'Equipe Teste', role: 'CLINICA' } },
}, createElement(Dashboard)), { endereco: `/clinica?data=${data}` })
const rotas = (agenda, extra = {}) => ({
  'GET /api/clinica/painel': { unidades: [unidade], modulos: ['clinicas', 'agendamentos'] },
  'GET /api/clinica/agendamentos': agenda,
  ...extra,
})

test('unidade: soma todas as páginas, filtra status e troca a data sem mostrar a agenda anterior', async () => {
  const chamadas = apiFalsa(rotas(({ parametros }) => {
    if (parametros.get('de') === '2026-11-11') return { conteudo: [], totalPaginas: 0 }
    return { conteudo: parametros.get('pagina') === '0'
      ? [consulta('a1', 'Paciente aguardando', 'aguardando')]
      : [consulta('a2', 'Paciente atendido', 'realizada', '08:00')], totalPaginas: 2 }
  }))
  const tela = await montar()
  await esperar(() => porTexto('Paciente atendido', 'strong'))
  assert.ok(document.querySelector('button[aria-label="Consultas no dia: 2. Filtrar a agenda"]'))
  const lista = porTexto('Agenda da unidade', 'section').querySelector('ul')
  assert.equal(lista.querySelector('strong').textContent, 'Paciente atendido')
  await clicar(document.querySelector('button[aria-label="Pacientes aguardando: 1. Filtrar a agenda"]'))
  assert.equal(lista.querySelectorAll('li').length, 1)
  assert.equal(lista.querySelector('strong').textContent, 'Paciente aguardando')
  await digitar(document.querySelector('input[type="date"]'), '2026-11-11')
  await esperar(() => porTexto('Nenhuma consulta agendada', 'p'))
  assert.equal(porTexto('Paciente aguardando', 'strong'), null)
  assert.ok(tela.onde().includes('data=2026-11-11'))
  // A unidade vem da conta: nenhum seletor de unidade, nenhum id de unidade enviado.
  assert.equal(document.querySelector('select'), null)
  assert.ok(chamadas.filter((c) => c.caminho === '/api/clinica/agendamentos').every((c) => !c.parametros.has('unidadeId')))
})

test('unidade: segue o padrão do painel do médico (agenda do dia, filtros e coluna direita)', async () => {
  apiFalsa(rotas({ conteudo: [
    consulta('a1', 'Paciente em consulta', 'em_andamento', '08:00'),
    consulta('a2', 'Paciente seguinte', 'confirmada', '09:00'),
    consulta('a3', 'Paciente cancelado', 'cancelada', '10:00'),
  ], totalPaginas: 1 }))
  await montar()
  await esperar(() => porTexto('Paciente seguinte', 'strong'))
  assert.ok(porTexto('Olá, Equipe!', 'h1'))
  const trilha = document.querySelector('aside[aria-label="Informações da unidade"]')
  const dia = porTexto('Agenda do dia', 'section')
  assert.ok(trilha.contains(dia))
  assert.ok(dia.textContent.includes('Paciente em consulta'))
  assert.ok(dia.textContent.includes('Paciente seguinte'))
  assert.ok(document.querySelector('a[href="/clinica/conta"]'), 'leva à edição do contato')
  assert.equal(document.querySelector('a[href^="/admin"]'), null, 'nenhum link para a área administrativa')
  await clicar(porTexto('1 consulta a seguir', 'button'))
  const lista = porTexto('Agenda da unidade', 'section').querySelector('ul')
  assert.deepEqual([...lista.querySelectorAll('strong')].map((s) => s.textContent), ['Paciente seguinte'])
  assert.equal(document.querySelector('button[aria-pressed="true"]').textContent, 'Próximas1')
})

test('unidade: recepção confirma, registra chegada e cancela (com confirmação) pela rota da clínica', async () => {
  const hoje = hojeNaClinica()
  let agenda = [consulta('a1', 'Paciente pendente', 'pendente', '08:00'), consulta('a2', 'Paciente confirmado', 'confirmada', '09:00')]
  const chamadas = apiFalsa(rotas(() => ({ conteudo: agenda, totalPaginas: 1 }), {
    'PATCH /api/clinica/agendamentos/a1/status': ({ corpo }) => {
      agenda = agenda.map((c) => (c.id === 'a1' ? { ...c, status: corpo.status } : c))
      return agenda[0]
    },
    'PATCH /api/clinica/agendamentos/a2/status': ({ corpo }) => {
      agenda = agenda.map((c) => (c.id === 'a2' ? { ...c, status: corpo.status } : c))
      return agenda[1]
    },
  }))
  await montar(hoje)
  await clicar(await esperar(() => document.querySelector('button[aria-label="Confirmar: Paciente pendente, 08:00"]')))
  await esperar(() => porTexto('Consulta de Paciente pendente confirmada.', 'p'))
  assert.deepEqual(chamadas.find((c) => c.caminho === '/api/clinica/agendamentos/a1/status').corpo, { status: 'confirmada' })

  await clicar(await esperar(() => document.querySelector('button[aria-label="Registrar chegada: Paciente confirmado, 09:00"]')))
  await esperar(() => porTexto('Consulta de Paciente confirmado com chegada registrada.', 'p'))

  await clicar(await esperar(() => document.querySelector('button[aria-label="Cancelar: Paciente pendente, 08:00"]')))
  assert.equal(chamadas.filter((c) => c.metodo === 'PATCH').length, 2, 'cancelar pede confirmação antes')
  await clicar(await esperar(() => porTexto('Cancelar consulta', '[role="dialog"] button')))
  await esperar(() => porTexto('Consulta de Paciente pendente cancelada.', 'p'))
  assert.equal(chamadas.filter((c) => c.metodo === 'PATCH').at(-1).corpo.status, 'cancelada')
})

test('unidade: chegada não aparece para consulta de outro dia', async () => {
  apiFalsa(rotas({ conteudo: [consulta('a1', 'Paciente futuro', 'confirmada')], totalPaginas: 1 }))
  await montar('2099-01-10')
  await esperar(() => porTexto('Paciente futuro', 'strong'))
  assert.equal(document.querySelector('button[aria-label^="Registrar chegada"]'), null)
  assert.ok(document.querySelector('button[aria-label^="Cancelar: Paciente futuro"]'))
})

test('unidade: falha da agenda permite nova tentativa sem inventar indicadores', async () => {
  let falhar = true
  apiFalsa(rotas(() => falhar ? { status: 503, corpo: {} } : {
    conteudo: [consulta('a1', 'Paciente da API', 'confirmada')], totalPaginas: 1,
  }))
  await montar()
  await esperar(() => porTexto('O servidor não respondeu', 'p'))
  assert.equal(document.querySelector('button[aria-label^="Consultas no dia"]'), null)
  falhar = false
  await clicar(porTexto('Tentar de novo', 'button'))
  await esperar(() => porTexto('Paciente da API', 'strong'))
})

test('unidade: conta sem unidade orienta a procurar a administração, sem link para o admin', async () => {
  const chamadas = apiFalsa({ 'GET /api/clinica/painel': { unidades: [], modulos: ['clinicas', 'agendamentos'] } })
  await montar()
  await esperar(() => porTexto('Unidade não encontrada', 'h2'))
  assert.equal(chamadas.some((c) => c.caminho === '/api/clinica/agendamentos'), false)
  assert.equal(document.querySelector('a[href^="/admin"]'), null)
})

test('unidade: hoje respeita São Paulo na virada do dia UTC', () => {
  assert.equal(hojeNaClinica(new Date('2026-11-11T01:00:00Z')), '2026-11-10')
})
