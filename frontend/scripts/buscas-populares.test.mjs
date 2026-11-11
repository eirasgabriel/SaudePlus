// "Buscas populares" na seção de especialidades da página inicial: vêm da API
// (mais buscadas em 30 dias) e somem quando não há dados, sem lista inventada.
import { apiFalsa, carregar, createElement, encerrar, esperar, limpar, renderizar, window } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, describe, test } from 'node:test'

let Home
let Especialidades

before(async () => {
  Home = (await carregar('/src/features/home/pages/Home.jsx')).default
  Especialidades = (await carregar('/src/features/profissionais/pages/Especialidades.jsx')).default
})
afterEach(limpar)
after(encerrar)

const faixa = () => window.document.querySelector('nav[aria-labelledby="buscas-populares-titulo"]')
const esperarChamada = (chamadas) =>
  esperar(() => chamadas.some((c) => c.caminho === '/api/publico/buscas-populares'), { mensagem: 'chamada às buscas populares' })

describe('Buscas populares na página inicial', () => {
  test('mostra as especialidades na ordem da API, com link para a busca filtrada', async () => {
    const chamadas = apiFalsa({
      'GET /api/publico/buscas-populares': [
        { slug: 'pediatria', nome: 'Pediatria' },
        { slug: 'clinico-geral', nome: 'Clínico Geral' },
      ],
    })
    await renderizar(createElement(Home))
    await esperar(faixa, { mensagem: 'faixa de buscas populares' })

    const links = [...faixa().querySelectorAll('a')]
    assert.deepEqual(links.map((a) => a.textContent), ['Pediatria', 'Clínico Geral'])
    assert.equal(links[1].getAttribute('href'), '/buscar?especialidade=Cl%C3%ADnico%20Geral')
    assert.equal(chamadas.find((c) => c.caminho === '/api/publico/buscas-populares').parametros.get('limite'), '6')
  })

  test('lista vazia: a faixa não aparece', async () => {
    const chamadas = apiFalsa({ 'GET /api/publico/buscas-populares': [] })
    await renderizar(createElement(Home))
    await esperarChamada(chamadas)
    await esperar(() => true)
    assert.equal(faixa(), null)
  })

  test('sem API: a faixa não aparece e a página continua', async () => {
    apiFalsa(null)
    await renderizar(createElement(Home))
    await esperar(() => true)
    assert.equal(faixa(), null)
    assert.ok(window.document.getElementById('specialties-title'))
  })
})

describe('Buscas populares na página Especialidades', () => {
  const faixaEsp = () => window.document.querySelector('nav[aria-label="Buscas populares"]')

  test('mostra só as mais buscadas que a API devolve', async () => {
    const chamadas = apiFalsa({
      'GET /api/publico/buscas-populares': [{ slug: 'cardiologia', nome: 'Cardiologia' }],
    })
    await renderizar(createElement(Especialidades))
    await esperar(faixaEsp, { mensagem: 'faixa de buscas populares' })
    assert.deepEqual([...faixaEsp().querySelectorAll('a')].map((a) => a.textContent), ['Cardiologia'])
    assert.equal(chamadas.find((c) => c.caminho === '/api/publico/buscas-populares').parametros.get('limite'), '10')
  })

  for (const [caso, api] of [['sem dados', { 'GET /api/publico/buscas-populares': [] }], ['sem API', null]]) {
    test(`${caso}: o cartão fica em branco, sem botões nem mensagem`, async () => {
      const chamadas = apiFalsa(api)
      await renderizar(createElement(Especialidades))
      await esperarChamada(chamadas)
      await esperar(() => true)
      assert.ok(faixaEsp())
      assert.equal(faixaEsp().querySelectorAll('a').length, 0)
      assert.equal(faixaEsp().textContent.trim(), 'Buscas populares:')
    })
  }
})
