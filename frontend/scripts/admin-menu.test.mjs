// Menu do admin: o painel da unidade clínica é da conta da própria unidade
// (/clinica), não dos administradores. A aba saiu e o link antigo volta ao início.
// "Minha conta" mostra a conta de quem está logado, não o sistema; e Configurações
// não repete as listas de usuários e clínicas (que têm telas próprias).
import { apiFalsa, carregar, clicar, createElement, encerrar, esperar, limpar, porTexto, renderizar, window } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

let navegacao, App, AuthProvider
before(async () => {
  navegacao = await carregar('/src/services/dadosAdminNavegacao.js')
  App = (await carregar('/src/app/App.jsx')).default
  AuthProvider = (await carregar('/src/features/auth/AuthProvider.jsx')).default
})
afterEach(limpar)
after(encerrar)

test('menu do admin não tem a aba Unidade Clínica', () => {
  const todos = [...navegacao.itensMenu, ...navegacao.itensTopo]
  assert.equal(todos.find((i) => i.para === '/admin/unidade'), undefined)
  assert.equal(todos.find((i) => /unidade cl[ií]nica/i.test(i.rotulo)), undefined)
  assert.ok(navegacao.itensMenu.find((i) => i.para === '/admin/clinicas'), 'o cadastro de clínicas continua')
})

test('/admin/unidade (link antigo) leva ao início do admin', async () => {
  window.sessionStorage.setItem('saudeplus:token', 'tok-admin')
  apiFalsa({
    'GET /api/auth/perfil': { id: 'a1', nomeCompleto: 'Admin Teste', email: 'admin@x.com', role: 'ADMIN' },
    'GET /api/auth/modulos': ['clinicas', 'agendamentos', 'usuarios'],
  })
  const tela = await renderizar(createElement(AuthProvider, null, createElement(App)), { endereco: '/admin/unidade' })
  await esperar(() => tela.onde() === '/admin', { mensagem: 'redirecionar para /admin' })
  assert.equal(document.querySelector('a[href="/admin/unidade"]'), null, 'nenhum link para a aba removida')
})

const ADMIN = { id: 'a1', nomeCompleto: 'Admin Teste', email: 'admin@x.com', telefone: '(21) 99999-0000', role: 'ADMIN', fotoUrl: null }
const rotasDoAdmin = (extra = {}) => ({
  'GET /api/auth/perfil': ADMIN,
  'GET /api/auth/modulos': ['clinicas', 'agendamentos', 'usuarios', 'configuracoes'],
  'GET /api/admin/notificacoes': [],
  ...extra,
})
const abrir = (endereco) => {
  window.sessionStorage.setItem('saudeplus:token', 'tok-admin')
  return renderizar(createElement(AuthProvider, null, createElement(App)), { endereco })
}

test('"Minha conta" leva às informações da conta de quem está logado', async () => {
  apiFalsa(rotasDoAdmin())
  const tela = await abrir('/admin')
  await clicar(await esperar(() => document.querySelector('button[aria-label^="Menu da conta de"]'), { mensagem: 'botão da conta' }))
  const link = await esperar(() => [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'Minha conta'), { mensagem: 'link Minha conta' })
  assert.equal(link.getAttribute('href'), '/admin/conta')
  await clicar(link)
  await esperar(() => tela.onde() === '/admin/conta')
  await esperar(() => porTexto('Informações da conta', 'h2'), { mensagem: 'cartão da conta' })
  const conta = porTexto('Informações da conta', 'h2').closest('section')
  assert.ok(conta.textContent.includes('admin@x.com'))
  assert.match(conta.textContent, /Administrador/)
  assert.ok(porTexto('Alterar senha', 'h2') || porTexto('Senha', 'h2'), 'troca de senha')
  assert.equal(porTexto('Informações do Sistema', 'h2'), null, 'nada do sistema aqui')
})

test('Configurações: sem as listas de usuários e clínicas; permissões continuam', async () => {
  apiFalsa(rotasDoAdmin({
    'GET /api/admin/permissoes': { matriz: { usuarios: { ADMIN: true, GESTOR: true } } },
    'GET /api/admin/configuracoes': {},
    'GET /api/admin/sistema': { versao: '1', banco: 'PostgreSQL', fusoHorario: 'America/Sao_Paulo' },
    'GET /api/admin/usuarios': { conteudo: [{ id: 'u1', nomeCompleto: 'Gestora', papel: 'GESTOR', email: 'g@x.com', status: 'ativo' }], totalPaginas: 1 },
  }))
  await abrir('/admin/configuracoes?aba=usuarios')
  await esperar(() => porTexto('Permissões por Módulo', 'h2'), { mensagem: 'matriz de permissões' })
  const abas = [...document.querySelectorAll('[role="tab"]')].map((t) => t.textContent.trim())
  assert.ok(abas.includes('Permissões'))
  assert.ok(!abas.some((a) => /Cl[ií]nicas/.test(a)), 'sem aba de clínicas')
  assert.ok(!abas.some((a) => /Usu[aá]rios/.test(a)), 'sem aba de usuários')
  assert.equal(porTexto('Usuários do Sistema', 'h2'), null, 'sem a lista de usuários')
  assert.ok(porTexto('Resumo dos Papéis', 'h2'))
})
