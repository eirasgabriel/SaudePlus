import { apiFalsa, carregar, clicar, createElement, digitar, encerrar, esperar, limpar, porTexto, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

// Em produção não há agenda de demonstração: médico sem janelas não tem horários.
// O modal precisa dizer isso, e não "nenhum horário nesse dia"; falha de rede
// também não pode virar "sem horários".
let Modal
before(async () => { Modal = (await carregar('/src/components/ModalAgendamento.jsx')).default })
afterEach(limpar)
after(encerrar)

const DATA = '2099-03-10'
const medico = (id, nome, modalidades) => ({ id, nome, modalidades, especialidades: [], local: null })
const rotas = (extra = {}) => ({
  'GET /api/publico/especialidades': [{ id: 'e1', slug: 'cardiologia', nome: 'Cardiologia' }],
  'GET /api/publico/profissionais': { conteudo: [medico('m1', 'Dr. Com Agenda', ['presencial']), medico('m2', 'Dra. Sem Agenda', [])], totalPaginas: 1 },
  ...extra,
})
const dialogo = () => document.querySelector('[role="dialog"]')
const selects = () => dialogo().querySelectorAll('select')
const fieldset = () => dialogo().querySelector('fieldset')

async function escolher(medicoId) {
  await renderizar(createElement(Modal, { aberto: true, aoFechar() {}, aoConfirmar() {} }))
  await esperar(() => selects()[0]?.options.length > 1)
  await digitar(selects()[0], 'e1')
  await esperar(() => selects()[1]?.options.length > 2)
  await digitar(selects()[1], medicoId)
  await digitar(dialogo().querySelector('input[type="date"]'), DATA)
}

test('médico sem agenda aberta: avisa e não busca horários', async () => {
  const chamadas = apiFalsa(rotas())
  await escolher('m2')
  await esperar(() => porTexto('ainda não abriu agenda', 'p', fieldset()))
  assert.equal(porTexto('Nenhum horário livre', 'p', fieldset()), null)
  assert.equal(chamadas.filter((c) => c.caminho.endsWith('/horarios')).length, 0)
  assert.match([...selects()[1].options].find((o) => o.value === 'm2').textContent, /sem agenda/)
})

test('falha ao buscar horários mostra erro com nova tentativa', async () => {
  let falhar = true
  apiFalsa(rotas({
    'GET /api/publico/profissionais/m1/horarios': () => falhar
      ? { status: 500, corpo: { mensagem: 'Erro interno' } }
      : [{ data: DATA, horario: '09:00', duracaoMin: 30, unidadeId: 'u1', modalidade: 'presencial' }],
  }))
  await escolher('m1')
  const erro = await esperar(() => porTexto('Não foi possível carregar os horários', '[role="alert"]', fieldset()))
  assert.ok(erro)
  assert.equal(porTexto('Nenhum horário livre', 'p', fieldset()), null)
  falhar = false
  await clicar(porTexto('Tentar de novo', 'button', fieldset()))
  await esperar(() => porTexto('09:00', 'button', fieldset()))
})

test('dia sem vagas continua sugerindo outra data', async () => {
  apiFalsa(rotas({ 'GET /api/publico/profissionais/m1/horarios': [] }))
  await escolher('m1')
  await esperar(() => porTexto('Nenhum horário livre nesse dia', 'p', fieldset()))
})
