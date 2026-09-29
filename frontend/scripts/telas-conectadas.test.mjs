import {
  apiFalsa, carregar, clicar, createElement, digitar, encerrar, enviar, esperar, limpar, porTexto, renderizar,
} from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

let AuthContext
let Agenda
let PerfilPaciente
let Notificacoes
let ExamesAdmin
before(async () => {
  ;({ AuthContext } = await carregar('/src/features/auth/auth.context.js'))
  Agenda = (await carregar('/src/features/medico/telas/AgendaDoMedico.jsx')).default
  PerfilPaciente = (await carregar('/src/features/paciente/pages/MinhasInformacoes.jsx')).default
  Notificacoes = (await carregar('/src/features/paciente/pages/NotificacoesDoPaciente.jsx')).default
  ExamesAdmin = (await carregar('/src/features/admin/pages/ExamesDoAdmin.jsx')).default
})
afterEach(limpar)
after(encerrar)

const sessao = { usuario: { nomeCompleto: 'Maria Teste', role: 'MEDICO' }, sair() {}, atualizarUsuario() {} }
const montar = (Componente, endereco) => renderizar(
  createElement(AuthContext.Provider, { value: sessao }, createElement(Componente)), { endereco },
)
const unidade = { id: 'u1', nome: 'Centro', status: 'ativa' }
const janela = { id: 'j1', unidade, diaSemana: 1, inicio: '08:00', fim: '12:00', duracaoMin: 30, modalidade: 'presencial' }
const agendaApi = {
  'GET /api/medico/notificacoes': [],
  'GET /api/medico/agenda': [],
  'GET /api/medico/unidades': [unidade],
  'GET /api/medico/disponibilidades': [janela],
  'GET /api/medico/bloqueios': [],
}

test('agenda edita a janela existente e envia os campos esperados pela API', async () => {
  let atual = janela
  const chamadas = apiFalsa({
    ...agendaApi,
    'GET /api/medico/disponibilidades': () => [atual],
    'PUT /api/medico/disponibilidades/j1': ({ corpo }) => { atual = { ...atual, ...corpo }; return atual },
  })
  await montar(Agenda, '/medico/agenda')
  await clicar(await esperar(() => porTexto('Editar', 'button')))
  await digitar(document.querySelector('#janela-fim'), '13:00')
  await enviar(document.querySelector('[role="dialog"] form'))
  await esperar(() => porTexto('Horário de atendimento atualizado.', '[role="status"]'))
  assert.deepEqual(chamadas.find(c => c.metodo === 'PUT').corpo, {
    unidadeId: 'u1', inicio: '08:00', fim: '13:00', modalidade: 'presencial', diaSemana: 1, duracaoMin: 30,
  })
  assert.equal(document.querySelector('[role="dialog"]'), null)
  assert.ok(porTexto('13:00', 'span'))
})

test('bloqueio com conflito pede confirmação antes de cancelar consultas', async () => {
  const chamadas = apiFalsa({
    ...agendaApi,
    'POST /api/medico/bloqueios': ({ parametros }) => parametros.get('cancelarAgendamentos') === 'true'
      ? { agendamentosCancelados: 1 }
      : { status: 422, corpo: { mensagem: 'Há consultas neste período.' } },
  })
  await montar(Agenda, '/medico/agenda')
  await clicar(await esperar(() => porTexto('Bloquear período', 'button')))
  await digitar(document.querySelector('#bloqueio-inicio'), '2026-10-10T08:00')
  await digitar(document.querySelector('#bloqueio-fim'), '2026-10-10T12:00')
  await enviar(document.querySelector('[role="dialog"] form'))
  assert.ok(porTexto('Bloquear e cancelar consultas', 'button'))
  assert.equal(chamadas.filter(c => c.metodo === 'POST').length, 1)
  await enviar(document.querySelector('[role="dialog"] form'))
  await esperar(() => porTexto('1 consulta(s) cancelada(s)', '[role="status"]'))
  assert.equal(chamadas.filter(c => c.metodo === 'POST')[1].parametros.get('cancelarAgendamentos'), 'true')
})

test('modal mantém o foco do teclado dentro do formulário', async () => {
  apiFalsa(agendaApi)
  await montar(Agenda, '/medico/agenda')
  await clicar(await esperar(() => porTexto('Editar', 'button')))
  const dialogo = document.querySelector('[role="dialog"]')
  const primeiro = dialogo.querySelector('button')
  const ultimo = dialogo.querySelector('button[type="submit"]')
  ultimo.focus()
  ultimo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
  assert.ok(document.activeElement === primeiro, 'Tab volta ao primeiro controle')
  primeiro.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }))
  assert.ok(document.activeElement === ultimo, 'Shift+Tab volta ao último controle')
})

test('perfil do paciente salva dados e mantém CPF já cadastrado bloqueado', async () => {
  let perfil = { id: 'p1', nome: 'Maria Teste', email: 'maria@example.com', cpf: '90000000191', convenio: null }
  const chamadas = apiFalsa({
    'GET /api/paciente/perfil': () => perfil,
    'GET /api/publico/convenios': [],
    'PUT /api/paciente/perfil': ({ corpo }) => { perfil = { ...perfil, nome: corpo.nomeCompleto }; return perfil },
  })
  await montar(PerfilPaciente, '/paciente/perfil')
  const label = await esperar(() => porTexto('Nome completo', 'label'))
  await digitar(document.getElementById(label.htmlFor), 'Maria Atualizada')
  const cpf = document.getElementById(porTexto('CPF', 'label').htmlFor)
  assert.equal(cpf.disabled, true)
  await enviar(document.getElementById(label.htmlFor).closest('form'))
  await esperar(() => porTexto('Dados salvos.', '[role="status"]'))
  const pedido = chamadas.find(c => c.metodo === 'PUT')
  assert.equal(pedido.corpo.nomeCompleto, 'Maria Atualizada')
  assert.equal('cpf' in pedido.corpo, false)
})

test('notificações marcam todas como lidas e atualizam os controles', async () => {
  let lida = false
  const chamadas = apiFalsa({
    'GET /api/paciente/notificacoes': () => [{ id: 'n1', titulo: 'Consulta confirmada', lida }],
    'PATCH /api/paciente/notificacoes/lidas': () => { lida = true; return null },
  })
  await montar(Notificacoes, '/paciente/notificacoes')
  await clicar(await esperar(() => porTexto('Marcar todas como lidas', 'button')))
  await esperar(() => !porTexto('Marcar todas como lidas', 'button'))
  assert.equal(chamadas.filter(c => c.metodo === 'PATCH').length, 1)
  assert.equal(porTexto('Marcar como lida', 'button'), null)
})

test('falha da API mostra erro e permite tentar novamente sem dados fictícios', async () => {
  apiFalsa(null)
  await montar(Notificacoes, '/paciente/notificacoes')
  const tentar = await esperar(() => porTexto('Tentar de novo', 'button'))
  assert.ok(document.querySelector('[role="alert"]'))
  apiFalsa({ 'GET /api/paciente/notificacoes': [] })
  await clicar(tentar)
  await esperar(() => porTexto('Nenhuma notificação.', 'p'))
  assert.equal(document.querySelector('[role="alert"]'), null)
})

test('coleta exige seleção explícita da unidade e preserva horário local', async () => {
  const chamadas = apiFalsa({
    'GET /api/admin/exames': [{ id: 'e1', nome: 'Hemograma', paciente: 'Maria', status: 'agendado', dataHora: '2026-10-10T08:00:00', unidade: 'Outra unidade' }],
    'GET /api/admin/unidades': [unidade],
    'PATCH /api/admin/exames/e1/agendamento': {},
  })
  await montar(ExamesAdmin, '/admin/exames')
  await clicar(await esperar(() => document.querySelector('[aria-label="Agendar coleta"]')))
  assert.equal(document.querySelector('#coleta-quando').value, '2026-10-10T08:00')
  assert.equal(document.querySelector('#coleta-unidade').value, '')
  await enviar(document.querySelector('[role="dialog"] form'))
  assert.equal(chamadas.filter(c => c.metodo === 'PATCH').length, 0)
  await digitar(document.querySelector('#coleta-unidade'), 'u1')
  await enviar(document.querySelector('[role="dialog"] form'))
  assert.deepEqual(chamadas.find(c => c.metodo === 'PATCH').corpo, { unidadeId: 'u1', dataHora: '2026-10-10T08:00' })
})
