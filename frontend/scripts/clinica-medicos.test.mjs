import { apiFalsa, carregar, clicar, createElement, digitar, encerrar, enviar, esperar, limpar, porTexto, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

let App, AuthContext
before(async () => {
  App = (await carregar('/src/app/App.jsx')).default
  ;({ AuthContext } = await carregar('/src/features/auth/auth.context.js'))
})
afterEach(limpar)
after(encerrar)

const ana = { id: 'm1', nome: 'Dra. Ana Souza', fotoUrl: null, crm: '123456', crmUf: 'RJ', especialidades: ['Cardiologia'], status: 'ativo', vinculado: true }
const bruno = { id: 'm2', nome: 'Dr. Bruno Lima', fotoUrl: null, crm: '654321', crmUf: 'SP', especialidades: [], status: 'ativo', vinculado: false }
const montar = (endereco = '/clinica/medicos') => renderizar(createElement(AuthContext.Provider, {
  value: { usuario: { nomeCompleto: 'Clínica Teste', email: 'clinica@example.com', role: 'CLINICA' }, carregando: false, sair() {} },
}, createElement(App)), { endereco })

test('aba Médicos aparece no menu da clínica e lista o corpo clínico', async () => {
  apiFalsa({ 'GET /api/clinica/medicos': [ana] })
  await montar()
  await esperar(() => porTexto('Dra. Ana Souza', 'strong'))
  assert.ok(document.querySelector('a[href="/clinica/medicos"]'))
  assert.ok(porTexto('CRM 123456/RJ · Cardiologia', 'span'))
})

test('busca exige 2 caracteres, vincula o médico e relê a lista', async () => {
  let vinculados = []
  const chamadas = apiFalsa({
    'GET /api/clinica/medicos': () => vinculados,
    'GET /api/clinica/medicos/disponiveis': [bruno],
    'POST /api/clinica/medicos': () => { vinculados = [{ ...bruno, vinculado: true }]; return { status: 201, corpo: vinculados[0] } },
  })
  await montar()
  await esperar(() => porTexto('Nenhum médico vinculado', 'p'))
  const campo = document.querySelector('input[type="search"]')
  await digitar(campo, 'b')
  await enviar(campo.form)
  assert.ok(porTexto('pelo menos 2 caracteres', '[role="alert"]'))
  assert.equal(chamadas.filter((c) => c.caminho.endsWith('/disponiveis')).length, 0)
  await digitar(campo, ' Bruno ')
  await enviar(campo.form)
  await esperar(() => document.querySelector('button[aria-label="Vincular Dr. Bruno Lima"]'))
  assert.equal(chamadas.find((c) => c.caminho.endsWith('/disponiveis')).parametros.get('busca'), 'Bruno')
  await clicar(document.querySelector('button[aria-label="Vincular Dr. Bruno Lima"]'))
  await esperar(() => document.querySelector('button[aria-label="Desvincular Dr. Bruno Lima"]'))
  assert.deepEqual(chamadas.find((c) => c.metodo === 'POST').corpo, { medicoId: 'm2' })
  assert.ok(porTexto('foi vinculado à unidade', '[role="status"]'))
  assert.ok(chamadas.every((c) => c.caminho.startsWith('/api/clinica/')))
})

test('desvínculo pede confirmação e mostra a recusa do servidor', async () => {
  let respostaRemover = { status: 422, corpo: { mensagem: 'O médico tem consultas futuras nesta unidade.' } }
  let vinculados = [ana]
  const chamadas = apiFalsa({
    'GET /api/clinica/medicos': () => vinculados,
    'DELETE /api/clinica/medicos/m1': () => respostaRemover,
  })
  await montar()
  await esperar(() => document.querySelector('button[aria-label="Desvincular Dra. Ana Souza"]'))
  await clicar(document.querySelector('button[aria-label="Desvincular Dra. Ana Souza"]'))
  const confirmar = () => porTexto('Desvincular', '[role="dialog"] button:not([aria-label])')
  await esperar(confirmar)
  assert.equal(chamadas.filter((c) => c.metodo === 'DELETE').length, 0)
  await clicar(confirmar())
  await esperar(() => porTexto('consultas futuras nesta unidade.', '[role="alert"]'))
  respostaRemover = { status: 204, corpo: null }
  vinculados = []
  await clicar(confirmar())
  await esperar(() => porTexto('Nenhum médico vinculado', 'p'))
  assert.equal(document.querySelector('[role="dialog"]'), null)
})
