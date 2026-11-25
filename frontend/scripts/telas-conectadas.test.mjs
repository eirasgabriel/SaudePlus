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
let ModalUsuario
before(async () => {
  ;({ AuthContext } = await carregar('/src/features/auth/auth.context.js'))
  Agenda = (await carregar('/src/features/medico/telas/AgendaDoMedico.jsx')).default
  PerfilPaciente = (await carregar('/src/features/paciente/pages/MinhasInformacoes.jsx')).default
  Notificacoes = (await carregar('/src/features/paciente/pages/NotificacoesDoPaciente.jsx')).default
  ExamesAdmin = (await carregar('/src/features/admin/pages/ExamesDoAdmin.jsx')).default
  ModalUsuario = (await carregar('/src/features/admin/components/ModalNovoUsuario.jsx')).default
})
afterEach(limpar)
after(encerrar)

test('edição de usuário valida a confirmação e só envia senha quando selecionada', async () => {
  const salvos = []
  await renderizar(createElement(ModalUsuario, {
    aberto: true, usuario: { nome: 'Maria Teste', email: 'maria@example.com', papel: 'GESTOR' },
    aoCriar: async dados => salvos.push(dados), aoFechar() {}, podeCriarAdmin: true,
  }))
  await digitar(document.querySelector('input[id$="-nomeCompleto"]'), 'Maria Teste')
  await enviar(document.querySelector('form'))
  assert.equal(salvos.length, 1)
  assert.equal(Object.hasOwn(salvos[0], 'novaSenha'), false)
  await clicar(document.querySelector('input[type="checkbox"]'))
  await digitar(document.querySelector('input[id$="-novaSenha"]'), 'novaSenha123')
  await digitar(document.querySelector('input[id$="-confirmarSenha"]'), 'diferente123')
  await enviar(document.querySelector('form'))
  assert.equal(salvos.length, 1)
  assert.ok(porTexto('As senhas não conferem.', 'p'))
  await digitar(document.querySelector('input[id$="-confirmarSenha"]'), 'novaSenha123')
  await enviar(document.querySelector('form'))
  assert.equal(salvos[1].novaSenha, 'novaSenha123')
  assert.equal(Object.hasOwn(salvos[1], 'confirmarSenha'), false)
  await clicar(document.querySelector('input[type="checkbox"]'))
  await enviar(document.querySelector('form'))
  assert.equal(Object.hasOwn(salvos[2], 'novaSenha'), false)
})

const sessao = { usuario: { nomeCompleto: 'Maria Teste', role: 'MEDICO' }, sair() {}, atualizarUsuario() {} }
const montar = (Componente, endereco) => renderizar(
  createElement(AuthContext.Provider, { value: sessao }, createElement(Componente)), { endereco },
)
const unidade = { id: 'u1', nome: 'Centro', status: 'ativa' }
const doisDigitos = (n) => String(n).padStart(2, '0')
function diaDaqui(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}
/** "2026-11-12" → "12/11/26" */
const ddmmaa = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a.slice(-2)}` }
const EM_5_DIAS = diaDaqui(5)
const janela = { id: 'j1', unidade, data: EM_5_DIAS, diaSemana: null, inicio: '08:00', fim: '12:00', duracaoMin: 30, modalidade: 'presencial' }
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
    unidadeId: 'u1', inicio: '08:00', fim: '13:00', modalidade: 'presencial', data: EM_5_DIAS, duracaoMin: 30,
  })
  assert.equal(document.querySelector('[role="dialog"]'), null)
  assert.ok(porTexto(`${ddmmaa(EM_5_DIAS)}, 08:00 às 13:00`, 'span'))
})

test('janela nova: "Uma data" é o padrão, com Data em dd/mm/aa de hoje em diante (sem dia da semana)', async () => {
  const chamadas = apiFalsa({
    ...agendaApi,
    'GET /api/medico/disponibilidades': [],
    'POST /api/medico/disponibilidades': ({ corpo }) => ({ id: 'j2', unidade, diaSemana: null, ...corpo }),
  })
  await montar(Agenda, '/medico/agenda')
  await clicar(await esperar(() => porTexto('Incluir horário', 'button')))
  assert.equal(document.querySelector('#janela-dia'), null, 'sem o campo "Dia da semana"')
  const campo = document.querySelector('#janela-data')
  const opcoes = [...campo.options]
  assert.equal(opcoes[0].value, diaDaqui(0), 'começa em hoje')
  assert.equal(opcoes[0].textContent, `${ddmmaa(diaDaqui(0))} (hoje)`)
  assert.equal(opcoes[1].textContent, ddmmaa(diaDaqui(1)))
  assert.ok(opcoes.every((o) => o.value >= diaDaqui(0)), 'nenhuma data passada')
  assert.equal(campo.value, diaDaqui(0))

  await digitar(campo, EM_5_DIAS)
  await enviar(document.querySelector('[role="dialog"] form'))
  await esperar(() => porTexto('Horário de atendimento incluído.', '[role="status"]'))
  assert.equal(chamadas.find(c => c.metodo === 'POST').corpo.data, EM_5_DIAS)
  assert.equal('diaSemana' in chamadas.find(c => c.metodo === 'POST').corpo, false)
})

test('janela nova "Toda semana" envia diaSemana, sem data', async () => {
  const chamadas = apiFalsa({
    ...agendaApi,
    'GET /api/medico/disponibilidades': [],
    'POST /api/medico/disponibilidades': ({ corpo }) => ({ id: 'j3', unidade, data: null, ...corpo }),
  })
  await montar(Agenda, '/medico/agenda')
  await clicar(await esperar(() => porTexto('Incluir horário', 'button')))
  await clicar(porTexto('Toda semana', 'button'))
  assert.equal(document.querySelector('#janela-data'), null, 'sem o campo Data')
  const dia = document.querySelector('#janela-dia')
  assert.equal(dia.options[0].textContent, 'Toda segunda')
  assert.equal(dia.options[6].textContent, 'Todo domingo')
  await digitar(dia, '3')
  await enviar(document.querySelector('[role="dialog"] form'))
  await esperar(() => porTexto('Horário de atendimento incluído.', '[role="status"]'))
  const corpo = chamadas.find(c => c.metodo === 'POST').corpo
  assert.equal(corpo.diaSemana, 3)
  assert.equal('data' in corpo, false)
})

test('janela semanal aparece como "Toda segunda", só leitura (sem Editar, com Remover)', async () => {
  apiFalsa({ ...agendaApi, 'GET /api/medico/disponibilidades': [{ ...janela, data: null, diaSemana: 1 }] })
  await montar(Agenda, '/medico/agenda')
  const item = (await esperar(() => porTexto('Toda segunda, 08:00 às 12:00', 'span'))).closest('li')
  assert.ok(item.textContent.includes('Repete toda semana'))
  const botoes = [...item.querySelectorAll('button')].map((b) => b.textContent.trim())
  assert.deepEqual(botoes, ['Remover'])
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
