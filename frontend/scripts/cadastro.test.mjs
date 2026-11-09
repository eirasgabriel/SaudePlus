import {
  carregar, clicar, createElement, digitar, encerrar, enviar, limpar, porTexto, renderizar,
} from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, describe, test } from 'node:test'

let AuthContext
let Cadastro
let avaliarForcaSenha
before(async () => {
  ;({ AuthContext } = await carregar('/src/features/auth/auth.context.js'))
  Cadastro = (await carregar('/src/features/auth/pages/Cadastro.jsx')).default
  ;({ avaliarForcaSenha } = await carregar('/src/features/auth/forcaSenha.js'))
})
afterEach(limpar)
after(encerrar)

describe('força da senha', () => {
  test('vazia não tem nível', () => {
    assert.equal(avaliarForcaSenha(''), null)
  })

  test('menos de 8 caracteres é sempre fraca', () => {
    assert.equal(avaliarForcaSenha('Ab1!x').nivel, 'fraca')
  })

  test('só letras minúsculas é fraca', () => {
    assert.equal(avaliarForcaSenha('abcdefgh').nivel, 'fraca')
  })

  test('minúsculas e números é fraca; com maiúsculas vira média', () => {
    assert.equal(avaliarForcaSenha('abcdefg1').nivel, 'fraca')
    assert.equal(avaliarForcaSenha('Abcdefg1').nivel, 'media')
  })

  test('maiúsculas, minúsculas, números e símbolos é forte', () => {
    assert.equal(avaliarForcaSenha('Abcdef1!').nivel, 'forte')
  })

  test('senha longa com mais de um tipo de caractere é forte', () => {
    assert.equal(avaliarForcaSenha('Senha muito longa1').nivel, 'forte')
  })
})

describe('cadastro', () => {
  const montar = (registrar) => renderizar(
    createElement(
      AuthContext.Provider,
      { value: { registrar, aplicarSessao() {} } },
      createElement(Cadastro),
    ),
  )

  async function preencher(senha, confirmacao) {
    const [senhaCampo, confirmacaoCampo] = document.querySelectorAll('input[type="password"]')
    await digitar(document.querySelector('input[autocomplete="name"]'), 'Ana Souza')
    await digitar(document.querySelector('input[type="email"]'), 'ana@x.com')
    await digitar(senhaCampo, senha)
    await digitar(confirmacaoCampo, confirmacao)
    await clicar(document.querySelector('#sp-aceite-termos'))
  }

  test('mostra o nível da senha enquanto a pessoa digita', async () => {
    await montar(async () => ({}))
    await digitar(document.querySelector('input[type="password"]'), 'Abcdef1!')
    assert.ok(porTexto('Senha forte', 'p'))
  })

  test('não envia quando a confirmação é diferente e nunca manda a confirmação', async () => {
    const enviados = []
    await montar(async (dados) => {
      enviados.push(dados)
      return { usuario: { nomeCompleto: 'Ana Souza', email: 'ana@x.com' } }
    })

    await preencher('Abcdef1!', 'Outra123!')
    await enviar(document.querySelector('form'))
    assert.equal(enviados.length, 0)
    assert.ok(porTexto('As senhas não conferem.', 'p'))

    await digitar(document.querySelectorAll('input[type="password"]')[1], 'Abcdef1!')
    await enviar(document.querySelector('form'))
    assert.equal(enviados.length, 1)
    assert.equal(enviados[0].senha, 'Abcdef1!')
    assert.equal(Object.hasOwn(enviados[0], 'confirmarSenha'), false)
  })
})
