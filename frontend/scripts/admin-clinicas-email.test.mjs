import { apiFalsa, carregar, clicar, createElement, digitar, encerrar, enviar, esperar, limpar, porTexto, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, test } from 'node:test'

let ClinicasDoAdmin
before(async () => {
  ;({ ClinicasDoAdmin } = await carregar('/src/features/admin/pages/AdminConectado.jsx'))
})
afterEach(limpar)
after(encerrar)

const unidade = {
  id: 'u1', nome: 'Clínica Centro', endereco: 'Rua A', cidade: 'Saquarema', uf: 'RJ', status: 'ativa',
  especialidades: [], medicos: 0, agendamentosNoMes: 0,
  email: 'contato@centro.com', emailLogin: 'acesso@centro.com',
}
const metricas = { total: 1, ativas: 1, manutencao: 0, inativas: 0 }

test('clínicas do admin: mostra o e-mail de acesso e o de contato, e edita o e-mail pela própria célula', async () => {
  let atual = unidade
  const chamadas = apiFalsa({
    'GET /api/admin/unidades': () => [atual],
    'GET /api/admin/unidades/metricas': metricas,
    'PUT /api/admin/unidades/u1': ({ corpo }) => { atual = { ...atual, emailLogin: corpo.emailLogin }; return atual },
  })
  await renderizar(createElement(ClinicasDoAdmin), { endereco: '/admin/clinicas' })
  const botao = await esperar(() => document.querySelector('button[aria-label="Editar e-mail de Clínica Centro: acesso@centro.com"]'))
  assert.ok(porTexto('Contato: contato@centro.com'))

  await clicar(botao)
  const campo = await esperar(() => document.getElementById('unidade-emailLogin'))
  assert.equal(campo.value, 'acesso@centro.com')
  await esperar(() => document.activeElement === campo)

  await digitar(campo, 'novo@centro.com')
  await enviar(campo.form)
  await esperar(() => document.querySelector('button[aria-label="Editar e-mail de Clínica Centro: novo@centro.com"]'))
  const put = chamadas.find((c) => c.metodo === 'PUT')
  assert.equal(put.corpo.emailLogin, 'novo@centro.com')
  assert.equal(put.corpo.senhaLogin, undefined, 'sem senha nova, a senha atual fica')
})
