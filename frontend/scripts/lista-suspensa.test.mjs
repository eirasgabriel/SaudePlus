// Lista suspensa (filtros da busca): abre com clique ou teclado, escolhe com
// clique, setas + Enter ou digitação, fecha com Esc e clique fora, e anuncia
// a opção ativa como combobox da WAI-ARIA.
import { act, carregar, clicar, createElement, encerrar, limpar, renderizar, window } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, describe, test } from 'node:test'
import { useState } from 'react'

let SelectField

before(async () => {
  SelectField = (await carregar('/src/components/SelectField/SelectField.jsx')).default
})
afterEach(limpar)
after(encerrar)

const OPCOES = [{ value: '', label: 'Qualquer especialidade' }, 'Cardiologia', 'Clínico Geral', 'Pediatria']
let escolhas

function Campo() {
  const [valor, setValor] = useState('')
  return createElement(SelectField, {
    id: 'campo', label: 'Especialidade', value: valor, options: OPCOES,
    onChange: (v) => { escolhas.push(v); setValor(v) },
  })
}

const doc = () => window.document
const botao = () => doc().getElementById('campo')
const lista = () => doc().querySelector('[role="listbox"]')
const opcoes = () => [...doc().querySelectorAll('[role="option"]')]
const teclar = (key) => act(async () => {
  botao().dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
})

describe('ListaSuspensa', () => {
  test('clique abre, escolhe e fecha; a opção escolhida fica marcada', async () => {
    escolhas = []
    await renderizar(createElement(Campo))
    assert.equal(botao().getAttribute('role'), 'combobox')
    assert.equal(botao().getAttribute('aria-labelledby'), 'campo-rotulo campo')
    assert.equal(lista().hidden, true)

    await clicar(botao())
    assert.equal(botao().getAttribute('aria-expanded'), 'true')
    assert.equal(lista().hidden, false)

    await clicar(opcoes()[3])
    assert.deepEqual(escolhas, ['Pediatria'])
    assert.equal(lista().hidden, true)
    assert.equal(botao().textContent, 'Pediatria')
    assert.equal(opcoes()[3].getAttribute('aria-selected'), 'true')
  })

  test('teclado: setas movem a ativa, Enter escolhe, Esc fecha sem escolher', async () => {
    escolhas = []
    await renderizar(createElement(Campo))
    await teclar('ArrowDown')
    assert.equal(botao().getAttribute('aria-activedescendant'), opcoes()[0].id)
    await teclar('ArrowDown')
    await teclar('ArrowDown')
    assert.equal(botao().getAttribute('aria-activedescendant'), opcoes()[2].id)
    await teclar('Escape')
    assert.equal(lista().hidden, true)
    assert.deepEqual(escolhas, [])

    await teclar('Enter')
    await teclar('End')
    await teclar('Enter')
    assert.deepEqual(escolhas, ['Pediatria'])
  })

  test('digitar a inicial escolhe sem abrir, ignorando acentos', async () => {
    escolhas = []
    await renderizar(createElement(Campo))
    await teclar('c')
    await teclar('l')
    assert.equal(escolhas.at(-1), 'Clínico Geral')
    assert.equal(lista().hidden, true)
  })

  test('clique fora fecha', async () => {
    escolhas = []
    await renderizar(createElement(Campo))
    await clicar(botao())
    await act(async () => {
      doc().body.dispatchEvent(new window.Event('pointerdown', { bubbles: true }))
    })
    assert.equal(lista().hidden, true)
  })
})
