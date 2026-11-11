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

const unidades = ['Centro', 'Lagoa'].map((nome, i) => ({
  id: `u${i + 1}`, nome, endereco: 'Rua da Clínica', cidade: 'Saquarema', uf: 'RJ',
  especialidades: ['Clínica Geral'], status: 'ativa', medicos: 2, agendamentosNoMes: 15,
}))
const consulta = (id, nome, status, horario = '09:00') => ({
  id, horario, status, paciente: { nome }, medico: { id: 'm1', nome: 'Médica Teste' }, especialidade: 'Clínica Geral',
})
const montar = () => renderizar(createElement(AuthContext.Provider, {
  value: { usuario: { nomeCompleto: 'Equipe Teste', role: 'GESTOR' } },
}, createElement(Dashboard)), { endereco: '/admin/unidade?unidade=u1&data=2026-11-10' })
const rotas = (agenda, modulos = ['clinicas', 'agendamentos']) => ({
  'GET /api/auth/modulos': modulos,
  'GET /api/admin/unidades': unidades,
  'GET /api/admin/agendamentos': agenda,
})

test('unidade: soma todas as páginas, filtra status e troca unidade/data sem mostrar a agenda anterior', async () => {
  const chamadas = apiFalsa(rotas(({ parametros }) => {
    if (parametros.get('unidadeId') === 'u2' || parametros.get('de') === '2026-11-11') {
      return { conteudo: [], totalPaginas: 0 }
    }
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
  await digitar(document.querySelector('select'), 'u2')
  await esperar(() => chamadas.some((c) => c.parametros.get('unidadeId') === 'u2'))
  await esperar(() => porTexto('Nenhuma consulta agendada', 'p'))
  assert.ok(tela.onde().includes('unidade=u2'))
  assert.ok(chamadas.filter((c) => c.caminho === '/api/admin/agendamentos').every((c) => c.parametros.get('de') === c.parametros.get('ate')))
})

test('unidade: segue o padrão do painel do médico (agenda do dia, filtros e coluna direita)', async () => {
  apiFalsa(rotas({ conteudo: [
    consulta('a1', 'Paciente em consulta', 'em_andamento', '08:00'),
    consulta('a2', 'Paciente seguinte', 'confirmada', '09:00'),
    consulta('a3', 'Paciente cancelado', 'cancelada', '10:00'),
  ], totalPaginas: 1 }))
  await montar()
  await esperar(() => porTexto('Paciente seguinte', 'strong'))
  // A faixa de boas-vindas abre a coluna principal; a coluna direita fica ao lado, com a Agenda do dia.
  assert.ok(porTexto('Olá, Equipe!', 'h1'))
  const trilha = document.querySelector('aside[aria-label="Informações da unidade"]')
  const dia = porTexto('Agenda do dia', 'section')
  assert.ok(trilha.contains(dia))
  assert.ok(dia.textContent.includes('Paciente em consulta'))
  assert.ok(dia.textContent.includes('Paciente seguinte'))
  // O "1 consulta a seguir" filtra a agenda pelas próximas, como no médico.
  await clicar(porTexto('1 consulta a seguir', 'button'))
  const lista = porTexto('Agenda da unidade', 'section').querySelector('ul')
  assert.deepEqual([...lista.querySelectorAll('strong')].map((s) => s.textContent), ['Paciente seguinte'])
  assert.equal(document.querySelector('button[aria-pressed="true"]').textContent, 'Próximas1')
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

test('unidade: perfil sem agenda vê os dados da clínica e não requisita consultas', async () => {
  const chamadas = apiFalsa(rotas({}, ['clinicas']))
  await montar()
  await esperar(() => porTexto('Seu perfil não tem acesso à agenda', 'p'))
  assert.ok(porTexto('Médicos vinculados', 'dt'))
  assert.equal(chamadas.some((c) => c.caminho === '/api/admin/agendamentos'), false)
})

test('unidade: sem permissão de clínicas não requisita unidades nem consultas', async () => {
  const chamadas = apiFalsa(rotas({}, ['agendamentos']))
  await montar()
  await esperar(() => porTexto('Seu perfil não tem acesso às unidades', 'p'))
  assert.equal(chamadas.length, 1)
})

test('unidade: cadastro vazio orienta a cadastrar e não carrega agenda', async () => {
  const chamadas = apiFalsa({ ...rotas({}), 'GET /api/admin/unidades': [] })
  await montar()
  await esperar(() => porTexto('Nenhuma unidade cadastrada', 'h2'))
  assert.equal(chamadas.some((c) => c.caminho === '/api/admin/agendamentos'), false)
  assert.ok(document.querySelector('a[href="/admin/clinicas"]'))
})

test('unidade: hoje respeita São Paulo na virada do dia UTC', () => {
  assert.equal(hojeNaClinica(new Date('2026-11-11T01:00:00Z')), '2026-11-10')
})
