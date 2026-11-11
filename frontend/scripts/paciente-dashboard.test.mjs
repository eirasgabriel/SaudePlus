import { apiFalsa, carregar, clicar, createElement, encerrar, esperar, limpar, porTexto, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

let App, AuthContext
before(async () => {
  App = (await carregar('/src/app/App.jsx')).default
  ;({ AuthContext } = await carregar('/src/features/auth/auth.context.js'))
})
afterEach(limpar)
after(encerrar)
const painel = { paciente: { nome: 'Paciente Teste' }, proximasConsultas: [], unidade: null, notificacoesNaoLidas: 2 }
const montar = (endereco = '/paciente') => renderizar(createElement(AuthContext.Provider, {
  value: { usuario: { nomeCompleto: 'Paciente Teste', role: 'PACIENTE' }, carregando: false, sair() {} },
}, createElement(App)), { endereco })
const rotas = {
  'GET /api/paciente/painel': painel,
  'GET /api/paciente/agendamentos': [{ id: 'a1', inicio: '2099-11-20T09:00:00',
    unidade: { nome: 'Unidade Centro' }, especialidade: { nome: 'Clínica Geral', id: 'e1' },
    medico: { nome: 'Profissional Teste', id: 'm1' }, status: 'confirmada', podeAlterar: true }],
  'GET /api/paciente/exames': [{ id: 'e1', nome: 'Hemograma de controle', status: 'em_analise', prazo: '2099-11-21' }],
}
const menu = (destino) => document.querySelector(`[aria-label="Menu do paciente"] a[href="${destino}"]`)

test('consultas e exames trocam só o conteúdo central e mantêm a dashboard montada', async () => {
  const chamadas = apiFalsa(rotas)
  const tela = await montar()
  await esperar(() => porTexto('Olá, Paciente Teste!', 'h1'))
  const cabecalho = document.querySelector('header')
  const lateral = document.querySelector('[aria-label="Menu do paciente"]')
  const direita = document.querySelector('[aria-label="Ações e informações"]')
  await clicar(document.querySelector('a[aria-label="Próximas consultas: Ver consultas"]'))
  await esperar(() => porTexto('Minhas consultas', 'h1'))
  assert.ok(porTexto('Profissional Teste', 'main'))
  assert.equal(tela.onde(), '/paciente/consultas')
  assert.equal(menu('/paciente/consultas').getAttribute('aria-current'), 'page')
  assert.equal(document.querySelector('header'), cabecalho)
  assert.equal(document.querySelector('[aria-label="Menu do paciente"]'), lateral)
  assert.equal(document.querySelector('[aria-label="Ações e informações"]'), direita)
  assert.equal(document.querySelectorAll('main').length, 1)
  assert.equal(document.querySelectorAll('h1').length, 1)
  assert.equal(document.querySelector('[role="dialog"]'), null)
  assert.equal(document.querySelector('main a[href="/paciente"]'), null)
  await clicar(menu('/paciente/exames'))
  await esperar(() => porTexto('Meus exames', 'h1'))
  assert.ok(porTexto('Hemograma de controle', 'main'))
  assert.equal(document.querySelector('header'), cabecalho)
  assert.equal(menu('/paciente/exames').getAttribute('aria-current'), 'page')
  await clicar(menu('/paciente'))
  await esperar(() => porTexto('Olá, Paciente Teste!', 'h1'))
  assert.ok(porTexto('Suas próximas consultas', 'h2'))
  assert.equal(chamadas.filter((c) => c.caminho === '/api/paciente/painel').length, 1)
})

test('link direto de exames usa a estrutura da dashboard mesmo se o resumo falhar', async () => {
  apiFalsa({ ...rotas, 'GET /api/paciente/painel': { status: 503, corpo: {} } })
  await montar('/paciente/exames')
  await esperar(() => porTexto('Meus exames', 'h1'))
  assert.ok(porTexto('Hemograma de controle', 'main'))
  assert.ok(menu('/paciente/consultas'))
  assert.ok(porTexto('Agendar agora', 'button'))
  assert.equal(document.querySelectorAll('h1').length, 1)
})

test('falha da lista conserva o menu e permite tentar novamente na dashboard', async () => {
  let falhar = true
  apiFalsa({ ...rotas, 'GET /api/paciente/agendamentos': () => falhar
    ? { status: 503, corpo: {} } : rotas['GET /api/paciente/agendamentos'] })
  await montar('/paciente/consultas')
  await esperar(() => porTexto('O servidor não respondeu', 'main'))
  const lateral = document.querySelector('[aria-label="Menu do paciente"]')
  falhar = false
  await clicar(porTexto('Tentar de novo', 'button'))
  await esperar(() => porTexto('Minhas consultas', 'h1'))
  assert.equal(document.querySelector('[aria-label="Menu do paciente"]'), lateral)
  assert.ok(porTexto('Profissional Teste', 'main'))
})
