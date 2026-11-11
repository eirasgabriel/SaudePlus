// Busca do cabeçalho: a lupa abre a busca (na faixa quando cabe; no jsdom,
// sem layout, cai no painel), o foco vai ao campo, Enter leva a /buscar?q= e
// Esc fecha devolvendo o foco à lupa.
import { act, apiFalsa, carregar, clicar, createElement, digitar, encerrar, enviar, limpar, renderizar, window } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, describe, test } from 'node:test'

let Header

before(async () => {
  Header = (await carregar('/src/layouts/Header.jsx')).default
})
afterEach(limpar)
after(encerrar)

const doc = () => window.document
const lupa = () => doc().querySelector('button[aria-controls^="header-search"]')

describe('Busca do cabeçalho', () => {
  test('abre, busca e fecha', async () => {
    apiFalsa({})
    const { onde } = await renderizar(createElement(Header))
    assert.equal(lupa().getAttribute('aria-expanded'), 'false')
    assert.ok(doc().getElementById('header-search').hasAttribute('inert'), 'campo da faixa inerte quando fechado')

    await clicar(lupa())
    assert.equal(lupa().getAttribute('aria-expanded'), 'true')
    const campo = doc().activeElement
    assert.equal(campo.type, 'search')

    await digitar(campo, 'cardio')
    await enviar(campo.form)
    assert.equal(onde(), '/buscar?q=cardio')
    assert.equal(lupa().getAttribute('aria-expanded'), 'false')

    await clicar(lupa())
    await act(async () => {
      doc().dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    assert.equal(lupa().getAttribute('aria-expanded'), 'false')
    assert.equal(doc().activeElement, lupa())
  })
})
