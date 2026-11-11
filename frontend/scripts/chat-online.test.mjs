// Popup do chat online da homepage: abre e fecha pelo botão, responde pelos
// assuntos sugeridos e pelo texto digitado, e admite quando não sabe.
import {
  act, apiFalsa, carregar, clicar, createElement, digitar, encerrar, enviar, limpar, porTexto, renderizar, window,
} from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, describe, test } from 'node:test'

let ChatFlutuante
let App
let AuthProvider
let encontrarAssunto

before(async () => {
  ChatFlutuante = (await carregar('/src/components/ChatFlutuante/ChatFlutuante.jsx')).default
  encontrarAssunto = (await carregar('/src/components/ChatFlutuante/respostas.js')).encontrarAssunto
  App = (await carregar('/src/app/App.jsx')).default
  AuthProvider = (await carregar('/src/features/auth/AuthProvider.jsx')).default
})
afterEach(limpar)
after(encerrar)

const doc = () => window.document
const botao = () => doc().querySelector('button[aria-expanded]')
const painel = () => doc().querySelector('[role="dialog"]')
const baloes = () => [...doc().querySelectorAll('[role="log"] li')].map((li) => li.textContent)

describe('Chat online', () => {
  test('abre com saudação e foco no campo; fecha pelo botão e pelo Esc', async () => {
    await renderizar(createElement(ChatFlutuante))
    assert.equal(painel(), null)

    await clicar(botao())
    assert.equal(botao().getAttribute('aria-expanded'), 'true')
    assert.match(baloes()[0], /assistente do SaúdePlus/)
    assert.equal(doc().activeElement, painel().querySelector('input'))

    await clicar(doc().querySelector('button[aria-label="Fechar chat"]'))
    assert.equal(painel(), null)

    await clicar(botao())
    await act(async () => {
      painel().dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })
    assert.equal(painel(), null)
    assert.equal(doc().activeElement, botao())
  })

  test('assunto sugerido mostra a pergunta e a resposta da FAQ com link', async () => {
    await renderizar(createElement(ChatFlutuante))
    await clicar(botao())
    await clicar(porTexto('Posso remarcar ou cancelar?', 'button'))

    const [, pergunta, resposta] = baloes()
    assert.match(pergunta, /Posso remarcar/)
    assert.match(resposta, /remarcar para outro horário livre/)
    assert.equal(porTexto('Minhas consultas', 'a').getAttribute('href'), '/paciente/consultas')
  })

  test('texto digitado: reconhece o assunto ou diz que não encontrou', async () => {
    await renderizar(createElement(ChatFlutuante))
    await clicar(botao())
    const campo = painel().querySelector('input')

    await digitar(campo, 'esqueci a minha senha')
    await enviar(painel().querySelector('form'))
    assert.match(baloes().at(-1), /Esqueci minha senha/)
    assert.equal(campo.value, '')

    await digitar(campo, 'qual a previsão do tempo?')
    await enviar(painel().querySelector('form'))
    assert.match(baloes().at(-1), /Não encontrei uma resposta/)

  })

  test('a conversa sobrevive ao desmontar (navegação) e recomeça sem a sessão', async () => {
    await renderizar(createElement(ChatFlutuante))
    await clicar(botao())
    await clicar(porTexto('Como criar uma conta?', 'button'))
    assert.equal(baloes().length, 3)

    const salvo = window.sessionStorage.getItem('saudeplus:chat-online')
    await limpar()
    window.sessionStorage.setItem('saudeplus:chat-online', salvo)
    await renderizar(createElement(ChatFlutuante))
    await clicar(botao())
    assert.equal(baloes().length, 3)
    await clicar(porTexto('Esqueci minha senha', 'button'))
    assert.equal(baloes().length, 5, 'ids continuam únicos depois de restaurar')

    window.sessionStorage.clear()
    await limpar()
    await renderizar(createElement(ChatFlutuante))
    await clicar(botao())
    assert.equal(baloes().length, 1)
  })

  test('encontrarAssunto ignora acentos e maiúsculas', () => {
    assert.equal(encontrarAssunto('Como faço pra AGENDAR uma consulta?')?.id, 'agendar')
    assert.equal(encontrarAssunto('aceita cartão de crédito?')?.id, 'pagamento')
    assert.equal(encontrarAssunto('quero falar com um atendente')?.id, 'atendente')
    assert.equal(encontrarAssunto('oi'), null)
  })
})

describe('Chat online no site público', () => {
  const aplicacao = (endereco) => renderizar(createElement(AuthProvider, null, createElement(App)), { endereco })
  const botaoFlutuante = () => doc().querySelector('button[aria-label="Abrir chat online"], button[aria-label="Fechar chat online"]')

  for (const endereco of ['/', '/especialidades', '/buscar', '/como-funciona', '/sobre-nos']) {
    test(`${endereco}: tem o botão flutuante`, async () => {
      apiFalsa({})
      await aplicacao(endereco)
      assert.ok(botaoFlutuante())
    })
  }

  test('/ajuda: sem botão flutuante; o cartão "Chat online" abre o chat e o foco volta a ele', async () => {
    apiFalsa({})
    await aplicacao('/ajuda')
    assert.equal(botaoFlutuante(), null)
    assert.equal(painel(), null)

    const cartao = porTexto('Respostas automáticas na hora', 'button')
    assert.ok(cartao, 'cartão do chat no Fale conosco')
    cartao.focus()
    await clicar(cartao)
    assert.ok(painel(), 'popup aberto')
    assert.match(baloes()[0], /assistente do SaúdePlus/)
    assert.ok(!doc().querySelector('dialog[open]'), 'não abre o aviso de "em breve"')

    await clicar(doc().querySelector('button[aria-label="Fechar chat"]'))
    assert.equal(painel(), null)
    assert.equal(doc().activeElement, cartao)
  })
})
