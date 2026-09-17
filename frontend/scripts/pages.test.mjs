import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let App

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  App = (await server.ssrLoadModule('/src/app/App.jsx')).default
})

after(async () => { await server?.close() })

function render(path) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)))
}

for (const [path, heading] of [
  ['/', 'Agende suas'],
  ['/especialidades', 'especialidade ideal'],
  ['/como-funciona', 'Cuidar da sua saúde'],
  ['/sobre-nos', 'Cuidado que conecta'],
  ['/ajuda', 'Estamos aqui'],
  ['/buscar', 'Sua saúde nas'],
  ['/pagina-inexistente', 'Página não encontrada'],
]) {
  test(`renderiza ${path} com layout e título únicos`, () => {
    const html = render(path)
    assert.equal((html.match(/<main\b/g) ?? []).length, 1)
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
    assert.ok(html.includes(heading))
    assert.ok(html.includes('aria-label="Principal"'))
    assert.ok(!html.includes('href="#agendar-'))
  })
}

for (const [query, names] of [
  ['', ['Roberto Almeida', 'Juliana Castro', 'Marcelo Santos', 'Fernanda Lima']],
  ['?q=cardiologia', ['Roberto Almeida']],
  ['?q=JULIANA', ['Juliana Castro']],
  ['?especialidade=Ginecologia', ['Fernanda Lima']],
  ['?profissional=marcelo-santos', ['Marcelo Santos']],
  ['?cidade=Rio%20de%20Janeiro%20-%20RJ', []],
  ['?tipo=domiciliar', []],
  ['?q=nenhum-resultado', []],
]) {
  test(`busca respeita os parâmetros ${query || '(sem filtros)'}`, () => {
    const html = render(`/buscar${query}`)
    assert.equal((html.match(/aria-labelledby="pro-/g) ?? []).length, names.length)
    for (const name of names) assert.ok(html.includes(name))
    if (!names.length) assert.ok(html.includes('Nenhum profissional encontrado'))
    assert.ok(html.includes('Nenhuma consulta será agendada'))
  })
}
