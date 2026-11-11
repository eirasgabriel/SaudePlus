// Profissionais em destaque: os cartões acompanham o ranking (a lista é
// buscada de novo periodicamente) e uma falha no meio não apaga os cartões.
import { apiFalsa, carregar, createElement, encerrar, esperar, limpar, renderizar } from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, describe, test } from 'node:test'

let useDestaques

before(async () => {
  useDestaques = (await carregar('/src/features/profissionais/useBuscaProfissionais.js')).useDestaques
})
afterEach(limpar)
after(encerrar)

const medico = (id, nome) => ({ id, nome, fotoUrl: null, especialidades: [{ slug: 'x', nome: 'Cardiologia' }], nota: 4.5, avaliacoes: 3 })
const A = medico('a', 'Dra. Ana')
const B = medico('b', 'Dr. Bruno')

/** Mostra os nomes na ordem, como a seção faria. */
function Lista() {
  const destaques = useDestaques(4, 40)
  return createElement('ol', { id: 'destaques' }, destaques.map((d) => createElement('li', { key: d.id }, d.name)))
}
const nomes = () => [...document.querySelectorAll('#destaques li')].map((li) => li.textContent).join(',')

describe('useDestaques', () => {
  test('atualiza quando o ranking muda e mantém os cartões se uma busca falhar', async () => {
    const respostas = [[A, B], [A, B], { status: 500, corpo: {} }, [B, A]]
    let pedidos = 0
    const chamadas = apiFalsa({
      'GET /api/publico/destaques': () => respostas[Math.min(pedidos++, respostas.length - 1)],
    })
    await renderizar(createElement(Lista))
    await esperar(() => nomes() === 'Dra. Ana,Dr. Bruno', { mensagem: 'primeiro ranking' })
    assert.equal(chamadas[0].parametros.get('limite'), '4')

    await esperar(() => pedidos >= 3, { mensagem: 'busca que falha' })
    assert.equal(nomes(), 'Dra. Ana,Dr. Bruno', 'a falha não apaga os cartões')

    await esperar(() => nomes() === 'Dr. Bruno,Dra. Ana', { mensagem: 'ranking novo' })
  })
})
