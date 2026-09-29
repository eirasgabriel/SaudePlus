import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let App
let ProfessionalCard
let DoctorCard

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  App = (await server.ssrLoadModule('/src/app/App.jsx')).default
  DoctorCard = (await server.ssrLoadModule('/src/features/profissionais/components/DoctorCard/DoctorCard.jsx')).default
  ProfessionalCard = (await server.ssrLoadModule('/src/features/profissionais/components/ProfessionalCard/ProfessionalCard.jsx')).default
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
  ['/profissionais/c1', 'Carregando perfil'],
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

// A busca vem da API depois da montagem; no SSR (sem efeitos) a tela fica em
// "buscando", com os parâmetros da URL já no painel. As regras da busca em si
// estão em busca.test.mjs.
for (const [query, valor] of [
  ['?q=cardiologia', 'value="cardiologia"'],
  ['?cidade=Rio%20de%20Janeiro%20-%20RJ', 'Rio de Janeiro - RJ'],
]) {
  test(`busca ${query} abre carregando, com o parâmetro no painel`, () => {
    const html = render(`/buscar${query}`)
    assert.ok(html.includes('Buscando profissionais…'))
    assert.equal((html.match(/aria-labelledby="pro-/g) ?? []).length, 0)
    assert.ok(html.includes(valor))
    assert.ok(html.includes('Para agendar, entre na sua conta'))
    assert.ok(!html.includes('Servidor indisponível'))
  })
}

// Cartão da busca: com dados da API, perfil e agendamento são links; com os
// profissionais de demonstração, continuam avisando que não estão disponíveis.
const CARTAO = {
  id: 'c1', name: 'Dr. Roberto Almeida', specialty: 'Cardiologia', crm: 'CRM 1-SP', rating: 4.9, reviews: 3,
  address: 'Av. Paulista', types: ['presencial'], slots: ['08:00'], slotsDate: '2026-09-29', photo: null,
  onUnavailable: () => {},
}
const renderCartao = (props) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProfessionalCard, { ...CARTAO, ...props })))

test('cartão da API leva ao perfil e ao agendamento', () => {
  const html = renderCartao({ perfilHref: '/profissionais/c1', agendarHref: () => '/paciente/consultas?agendar=c1' })
  assert.equal((html.match(/href="\/profissionais\/c1"/g) ?? []).length, 2)
  assert.ok(html.includes('href="/paciente/consultas?agendar=c1"'))
})

test('cartão de demonstração não tem links de perfil nem de agendamento', () => {
  const html = renderCartao({})
  assert.ok(!html.includes('href='))
  assert.ok(html.includes('Ver perfil'))
})

// Destaques: com a API, "Ver perfil" abre o perfil; na demonstração, busca pelo nome.
const renderDestaque = (props) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(DoctorCard, {
  name: 'Dra. Ana Lima', specialty: 'Pediatria', rating: 4.5, reviews: 2, photo: null, ...props,
})))

test('destaque da API leva ao perfil e mostra as iniciais sem foto', () => {
  const html = renderDestaque({ perfilHref: '/profissionais/c1' })
  assert.ok(html.includes('href="/profissionais/c1"'))
  assert.ok(html.includes('>AL<'))
  assert.ok(!html.includes('<img'))
})

test('destaque de demonstração busca pelo nome', () => {
  assert.ok(renderDestaque({ photo: '/f.jpg' }).includes('href="/buscar?q=Dra.%20Ana%20Lima"'))
})
