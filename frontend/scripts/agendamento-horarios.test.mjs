import { apiFalsa, carregar, clicar, createElement, digitar, encerrar, esperar, limpar, porTexto, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

// Modal de agendamento do paciente. A data é escolhida entre os dias com
// horário livre, de hoje em diante, mostrados em dd/mm/aa. Médico sem janelas
// não tem horários (sem agenda de demonstração), e falha de rede não vira
// "sem horários".
let Modal
before(async () => { Modal = (await carregar('/src/components/ModalAgendamento.jsx')).default })
afterEach(limpar)
after(encerrar)

const doisDigitos = (n) => String(n).padStart(2, '0')
function diaDaqui(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}
/** "2026-11-12" → "12/11/26" */
const ddmmaa = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a.slice(-2)}` }

const HOJE = diaDaqui(0)
const DEPOIS = diaDaqui(3)
const livre = (data, horario) => ({ data, horario, duracaoMin: 30, unidadeId: 'u1', modalidade: 'presencial' })

const medico = (id, nome, modalidades) => ({ id, nome, modalidades, especialidades: [], local: null })
const rotas = (extra = {}) => ({
  'GET /api/publico/especialidades': [{ id: 'e1', slug: 'cardiologia', nome: 'Cardiologia' }],
  'GET /api/publico/profissionais': { conteudo: [medico('m1', 'Dr. Com Agenda', ['presencial']), medico('m2', 'Dra. Sem Agenda', [])], totalPaginas: 1 },
  ...extra,
})
/** Horários do m1: o pedido do período (de ≠ ate) lista os dias; o do dia, os horários daquele dia. */
const horariosDoM1 = (porDia, { falharDia = () => false } = {}) => ({
  'GET /api/publico/profissionais/m1/horarios': ({ parametros }) => {
    const de = parametros.get('de')
    const ate = parametros.get('ate')
    if (de !== ate) return Object.entries(porDia).flatMap(([data, horas]) => horas.map((h) => livre(data, h)))
    if (falharDia()) return { status: 500, corpo: { mensagem: 'Erro interno' } }
    return (porDia[de] ?? []).map((h) => livre(de, h))
  },
})

const dialogo = () => document.querySelector('[role="dialog"]')
const selects = () => dialogo().querySelectorAll('select')
const fieldset = () => dialogo().querySelector('fieldset')
const botoesDeData = () => [...dialogo().querySelectorAll('[role="group"] button')]

async function escolherMedico(medicoId) {
  await renderizar(createElement(Modal, { aberto: true, aoFechar() {}, aoConfirmar() {} }))
  await esperar(() => selects()[0]?.options.length > 1)
  await digitar(selects()[0], 'e1')
  await esperar(() => selects()[1]?.options.length > 2)
  await digitar(selects()[1], medicoId)
}

test('datas: só dias com vaga, de hoje em diante, em dd/mm/aa (sem dia da semana)', async () => {
  const chamadas = apiFalsa(rotas(horariosDoM1({ [HOJE]: ['18:00'], [DEPOIS]: ['09:00', '09:30'] })))
  await escolherMedico('m1')
  await esperar(() => botoesDeData().length === 2, { mensagem: 'botões de data' })

  assert.deepEqual(botoesDeData().map((b) => b.textContent), [`${ddmmaa(HOJE)} (hoje)`, ddmmaa(DEPOIS)])
  assert.ok(botoesDeData().every((b) => /^\d{2}\/\d{2}\/\d{2}/.test(b.textContent)))
  assert.equal(dialogo().querySelector('input[type="date"]'), null, 'sem o seletor nativo (ano com 4 dígitos)')
  const periodo = chamadas.find((c) => c.caminho.endsWith('/horarios'))
  assert.equal(periodo.parametros.get('de'), HOJE, 'busca a partir de hoje')

  await clicar(botoesDeData()[1])
  await esperar(() => porTexto('09:30', 'button', fieldset()))
  await clicar(porTexto('09:30', 'button', fieldset()))
  assert.match(dialogo().textContent, new RegExp(`Consulta para ${ddmmaa(DEPOIS).replace(/\//g, '\\/')} às 09:30`))
})

test('médico sem agenda aberta: avisa e não busca dias nem horários', async () => {
  const chamadas = apiFalsa(rotas())
  await escolherMedico('m2')
  await esperar(() => porTexto('ainda não abriu agenda', 'p', fieldset()))
  assert.equal(porTexto('Nenhum horário livre', 'p', fieldset()), null)
  assert.equal(chamadas.filter((c) => c.caminho.endsWith('/horarios')).length, 0)
  assert.match([...selects()[1].options].find((o) => o.value === 'm2').textContent, /sem agenda/)
})

test('médico sem nenhum dia livre a partir de hoje: diz isso', async () => {
  apiFalsa(rotas(horariosDoM1({})))
  await escolherMedico('m1')
  await esperar(() => porTexto('Sem horários livres a partir de hoje', 'p'))
  assert.equal(botoesDeData().length, 0)
})

test('falha ao buscar horários do dia mostra erro com nova tentativa', async () => {
  let falhar = true
  apiFalsa(rotas(horariosDoM1({ [DEPOIS]: ['09:00'] }, { falharDia: () => falhar })))
  await escolherMedico('m1')
  await esperar(() => botoesDeData().length === 1)
  await clicar(botoesDeData()[0])
  const erro = await esperar(() => porTexto('Não foi possível carregar os horários', '[role="alert"]', fieldset()))
  assert.ok(erro)
  assert.equal(porTexto('Nenhum horário livre', 'p', fieldset()), null)
  falhar = false
  await clicar(porTexto('Tentar de novo', 'button', fieldset()))
  await esperar(() => porTexto('09:00', 'button', fieldset()))
})

test('falha ao buscar os dias livres mostra erro com nova tentativa', async () => {
  let falhar = true
  apiFalsa(rotas({
    'GET /api/publico/profissionais/m1/horarios': () => (falhar
      ? { status: 500, corpo: { mensagem: 'Erro interno' } }
      : [livre(DEPOIS, '10:00')]),
  }))
  await escolherMedico('m1')
  await esperar(() => porTexto('Não foi possível carregar os dias livres', 'p'))
  falhar = false
  await clicar(porTexto('Tentar de novo', 'button'))
  await esperar(() => botoesDeData().length === 1)
  assert.equal(botoesDeData()[0].textContent, ddmmaa(DEPOIS))
})

test('muitos dias livres: mostra os 10 primeiros e "Mais datas" abre o resto', async () => {
  const porDia = Object.fromEntries(Array.from({ length: 14 }, (_, i) => [diaDaqui(i + 1), ['09:00']]))
  apiFalsa(rotas(horariosDoM1(porDia)))
  await escolherMedico('m1')
  await esperar(() => botoesDeData().length > 0)
  const datas = () => botoesDeData().filter((b) => /^\d{2}\//.test(b.textContent))
  assert.equal(datas().length, 10)
  assert.equal(datas()[0].textContent, ddmmaa(diaDaqui(1)))
  await clicar(porTexto('Mais datas (4)', 'button'))
  assert.equal(datas().length, 14)
  assert.equal(porTexto('Mais datas', 'button'), null)
})
