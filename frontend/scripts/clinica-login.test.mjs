import { apiFalsa, carregar, clicar, createElement, digitar, encerrar, enviar, esperar, limpar, porTexto, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

let App, AuthContext, ModalUnidade
before(async () => {
  App = (await carregar('/src/app/App.jsx')).default
  ;({ AuthContext } = await carregar('/src/features/auth/auth.context.js'))
  ModalUnidade = (await carregar('/src/features/admin/components/ModalUnidade.jsx')).default
})
afterEach(limpar)
after(encerrar)
const unidade = { id: 'u1', nome: 'Clínica Teste', endereco: 'Rua de Teste', cidade: 'Saquarema', uf: 'RJ', status: 'ativa', especialidades: [], medicos: 0, agendamentosNoMes: 0 }
const montar = (endereco) => renderizar(createElement(AuthContext.Provider, {
  value: { usuario: { nomeCompleto: 'Clínica Teste', email: 'clinica@example.com', role: 'CLINICA' }, carregando: false, sair() {} },
}, createElement(App)), { endereco })

test('clínica usa a própria área, sem menu administrativo nem seleção de outra unidade', async () => {
  const chamadas = apiFalsa({
    'GET /api/clinica/painel': { unidades: [unidade], modulos: ['clinicas', 'agendamentos'] },
    'GET /api/clinica/agendamentos': { conteudo: [], totalPaginas: 0 },
  })
  const tela = await montar('/admin')
  await esperar(() => porTexto('Nenhuma consulta agendada', 'p'))
  assert.equal(tela.onde(), '/clinica')
  assert.ok(document.querySelector('select').disabled)
  assert.equal(document.querySelector('a[href^="/admin"]'), null)
  assert.ok(chamadas.every((c) => c.caminho.startsWith('/api/clinica/')))
  const agenda = chamadas.find((c) => c.caminho === '/api/clinica/agendamentos')
  assert.equal(agenda.parametros.has('unidadeId'), false)
})

test('conta da clínica troca a senha pelo endpoint autenticado e não envia confirmação', async () => {
  const chamadas = apiFalsa({ 'PUT /api/auth/senha': { mensagem: 'Senha alterada.' } })
  await montar('/clinica/conta')
  const campos = document.querySelectorAll('input[type="password"]')
  await digitar(campos[0], 'senhaAtual123')
  await digitar(campos[1], ' senhaNova123 ')
  await digitar(campos[2], 'diferente')
  await enviar(document.querySelector('form'))
  assert.equal(chamadas.length, 0)
  assert.ok(porTexto('As senhas não conferem.', 'p'))
  await digitar(campos[2], ' senhaNova123 ')
  await enviar(document.querySelector('form'))
  await esperar(() => porTexto('Senha alterada.', 'p'))
  assert.deepEqual(chamadas[0].corpo, { senhaAtual: 'senhaAtual123', novaSenha: ' senhaNova123 ' })
})

test('conta da clínica mostra quando a senha atual não confere e não limpa o formulário', async () => {
  apiFalsa({ 'PUT /api/auth/senha': { status: 400, corpo: {
    mensagem: 'A senha atual não confere.', campos: { senhaAtual: 'A senha atual não confere.' },
  } } })
  await montar('/clinica/conta')
  const campos = document.querySelectorAll('input[type="password"]')
  await digitar(campos[0], 'errada123')
  await digitar(campos[1], 'senhaNova123')
  await digitar(campos[2], 'senhaNova123')
  await enviar(document.querySelector('form'))
  await esperar(() => porTexto('A senha atual não confere.', 'p'))
  assert.equal(campos[1].value, 'senhaNova123')
  assert.equal(porTexto('Senha alterada.', 'p'), null)
})

test('cadastro da clínica exige login e senha, valida confirmação e preserva espaços na senha', async () => {
  const salvos = []
  await renderizar(createElement(ModalUnidade, { aberto: true, unidade, aoSalvar: async (dados) => salvos.push(dados), aoFechar() {} }))
  await enviar(document.querySelector('form'))
  assert.equal(salvos.length, 0)
  assert.ok(porTexto('Informe o e-mail de login.', 'p'))
  await digitar(document.getElementById('unidade-emailLogin'), 'login@example.com')
  await digitar(document.getElementById('unidade-senhaLogin'), ' senha123 ')
  await digitar(document.getElementById('unidade-confirmarSenha'), 'outraSenha')
  await enviar(document.querySelector('form'))
  assert.equal(salvos.length, 0)
  await digitar(document.getElementById('unidade-confirmarSenha'), ' senha123 ')
  await enviar(document.querySelector('form'))
  assert.equal(salvos[0].emailLogin, 'login@example.com')
  assert.equal(salvos[0].senhaLogin, ' senha123 ')
  assert.equal(Object.hasOwn(salvos[0], 'confirmarSenha'), false)
})

test('editar conta existente sem senha mantém a senha atual', async () => {
  const salvos = []
  await renderizar(createElement(ModalUnidade, { aberto: true, unidade: { ...unidade, emailLogin: 'login@example.com' }, aoSalvar: async (dados) => salvos.push(dados), aoFechar() {} }))
  await enviar(document.querySelector('form'))
  assert.equal(salvos.length, 1)
  assert.equal(salvos[0].senhaLogin, undefined)
})
