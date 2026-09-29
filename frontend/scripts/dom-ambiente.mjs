// Ambiente para testes com DOM de verdade (jsdom), sem biblioteca de testes:
// monta o navegador falso, a API falsa e os ajudantes de interação.
//
// IMPORTANTE: importe este arquivo ANTES de qualquer coisa que carregue o
// React. O react-dom decide se há DOM quando é carregado pela primeira vez.
import { JSDOM } from 'jsdom'
import { createServer } from 'vite'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true })
const { window } = dom

// Globais que o React, o React Router e o código do app esperam encontrar.
for (const nome of [
  'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
  'HTMLElement', 'HTMLInputElement', 'HTMLSelectElement', 'HTMLTextAreaElement', 'HTMLButtonElement',
  'Node', 'Element', 'Event', 'MouseEvent', 'KeyboardEvent', 'FocusEvent', 'InputEvent', 'CustomEvent',
  'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) {
  Object.defineProperty(globalThis, nome, { value: window[nome], configurable: true, writable: true })
}
// jsdom não implementa rolagem; o RouteEffects e o modal chamam.
window.scrollTo = () => {}
window.HTMLElement.prototype.scrollIntoView = () => {}
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { act, createElement } = await import('react')
const { createRoot } = await import('react-dom/client')
const { MemoryRouter, Routes, Route, useLocation } = await import('react-router-dom')

export { act, createElement, window }

/* ------------------------------------------------------------ Vite */

let server
/** Carrega um módulo do app pelo Vite (JSX, CSS Modules e imagens resolvidos). */
export async function carregar(caminho) {
  server ??= await createServer({
    root: new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    logLevel: 'silent',
  })
  return server.ssrLoadModule(caminho)
}

export async function encerrar() {
  await server?.close()
  server = undefined
}

/* ------------------------------------------------------------ API falsa */

/**
 * Troca o `fetch` por respostas combinadas: `{ 'GET /api/x': corpo | (req) => corpo }`.
 * Um corpo `{ status, corpo }` com `status` numérico responde aquele status.
 * `null` como API inteira simula o servidor fora do ar. As chamadas ficam em
 * `chamadas` (método, caminho, parâmetros e corpo), na ordem.
 */
export function apiFalsa(rotas) {
  const chamadas = []
  globalThis.fetch = async (url, opcoes = {}) => {
    const endereco = new URL(url, 'http://localhost')
    const metodo = opcoes.method ?? 'GET'
    const corpo = opcoes.body ? JSON.parse(opcoes.body) : undefined
    const chamada = { metodo, caminho: endereco.pathname, parametros: endereco.searchParams, corpo, headers: opcoes.headers ?? {} }
    chamadas.push(chamada)
    if (rotas === null) throw new TypeError('fetch failed')
    const chave = `${metodo} ${endereco.pathname}`
    let resposta = Object.prototype.hasOwnProperty.call(rotas, chave) ? rotas[chave] : { status: 404, corpo: { mensagem: 'Não encontrado' } }
    if (typeof resposta === 'function') resposta = await resposta(chamada)
    const temStatus = resposta && typeof resposta === 'object' && typeof resposta.status === 'number' && 'corpo' in resposta
    const status = temStatus ? resposta.status : 200
    const dados = temStatus ? resposta.corpo : resposta
    return new Response(dados == null ? null : JSON.stringify(dados), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  }
  return chamadas
}

/* ------------------------------------------------------------ render */

let montagens = []

/** Mostra onde o roteador está, para o teste conferir redirecionamentos. */
function Onde() {
  const { pathname, search } = useLocation()
  return createElement('output', { 'data-testid': 'onde' }, pathname + search)
}

/**
 * Renderiza `elemento` dentro de um MemoryRouter em `endereco`. Sem `rota`, o
 * elemento é a página inteira (ex.: <App />); com `rota`, vira a rota daquele padrão.
 */
export async function renderizar(elemento, { endereco = '/', rota } = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const raiz = createRoot(container)
  const conteudo = rota
    ? createElement(Routes, null, createElement(Route, { path: rota, element: elemento }), createElement(Route, { path: '*', element: null }))
    : elemento
  await act(async () => {
    raiz.render(createElement(MemoryRouter, { initialEntries: [endereco] }, conteudo, createElement(Onde)))
  })
  montagens.push(raiz)
  return {
    container,
    /** Endereço atual do roteador ("/paciente/consultas?agendar=c1"). */
    onde: () => document.querySelector('[data-testid="onde"]')?.textContent,
  }
}

/** Desmonta tudo, limpa o DOM e o storage. Chame no `afterEach`. */
export async function limpar() {
  for (const raiz of montagens) await act(async () => raiz.unmount())
  montagens = []
  document.body.innerHTML = ''
  window.sessionStorage.clear()
  window.localStorage.clear()
}

/* ------------------------------------------------------------ interação */

/** Espera `condicao()` ser verdadeira (ou devolver algo), deixando promessas e efeitos rodarem. */
export async function esperar(condicao, { limiteMs = 2000, mensagem = 'condição' } = {}) {
  const inicio = Date.now()
  for (;;) {
    let resultado
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })
    try {
      resultado = condicao()
    } catch {
      resultado = false
    }
    if (resultado) return resultado
    if (Date.now() - inicio > limiteMs) throw new Error(`Tempo esgotado esperando: ${mensagem}`)
  }
}

export async function clicar(elemento) {
  await act(async () => {
    elemento.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
  })
}

/** Digita num input controlado pelo React (o setter nativo dispara o onChange). */
export async function digitar(campo, valor) {
  const prototipo = campo instanceof window.HTMLSelectElement ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototipo, 'value').set.call(campo, valor)
    campo.dispatchEvent(new Event(campo instanceof window.HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}

export async function enviar(formulario) {
  await act(async () => {
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}

/** Primeiro elemento `seletor` cujo texto contém `texto`. */
export function porTexto(texto, seletor = '*', raiz = document.body) {
  return [...raiz.querySelectorAll(seletor)].find((el) => el.textContent.includes(texto)) ?? null
}
