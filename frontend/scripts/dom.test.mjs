// Telas com DOM de verdade (jsdom) e API falsa: efeitos, cliques, navegação
// e chamadas à API rodam como no navegador. Cobre o que o SSR dos outros
// testes não alcança: a busca com e sem API, o perfil, os destaques e o fluxo
// "Agendar" → login → agendamento já preenchido.
import {
  apiFalsa, carregar, clicar, createElement, digitar, encerrar, enviar, esperar, limpar, porTexto, renderizar, window,
} from './dom-ambiente.mjs'
import assert from 'node:assert/strict'
import { after, afterEach, before, describe, test } from 'node:test'

let App
let AuthProvider

before(async () => {
  App = (await carregar('/src/app/App.jsx')).default
  AuthProvider = (await carregar('/src/features/auth/AuthProvider.jsx')).default
})
afterEach(limpar)
after(encerrar)

/** A aplicação inteira, como em main.jsx. */
const aplicacao = (endereco) => renderizar(createElement(AuthProvider, null, createElement(App)), { endereco })

/* ------------------------------------------------------------ dados da API */

const doisDigitos = (n) => String(n).padStart(2, '0')
function diaDaqui(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}
const AMANHA = diaDaqui(1)
const DEPOIS = diaDaqui(2)

const UNIDADE = {
  id: 'u1', nome: 'SaudePlus Paulista', endereco: 'Av. Paulista, 1000', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP',
  telefone: '(11) 3000-1000', horarioFuncionamento: 'Seg a sex, 8h às 18h', mapUrl: 'https://maps.example/paulista',
}
const RESUMO = {
  id: 'c1', nome: 'Dr. Roberto Almeida', fotoUrl: null, crm: '123.456', crmUf: 'SP',
  especialidades: [{ slug: 'cardiologia', nome: 'Cardiologia' }], nota: 4.9, avaliacoes: 7,
  local: UNIDADE, modalidades: ['presencial'], convenios: ['Unimed'], valorConsulta: 250,
  proximaData: AMANHA, proximosHorarios: ['08:00', '08:30'],
}
const DETALHE = {
  id: 'c1', nome: 'Dr. Roberto Almeida', fotoUrl: null, crm: '123.456', crmUf: 'SP', bio: 'Cardiologista há 15 anos.',
  especialidades: [{ slug: 'cardiologia', nome: 'Cardiologia' }], nota: 4.9, avaliacoes: 7,
  unidades: [UNIDADE, { ...UNIDADE, id: 'u2', nome: 'Unidade sem mapa seguro', mapUrl: 'javascript:alert(1)' }],
  modalidades: ['presencial'], convenios: ['Unimed'], valorConsulta: 250,
}
const LIVRES = [
  { data: AMANHA, horario: '08:00', duracaoMin: 30, unidadeId: 'u1', modalidade: 'presencial' },
  { data: AMANHA, horario: '08:30', duracaoMin: 30, unidadeId: 'u1', modalidade: 'presencial' },
  { data: DEPOIS, horario: '09:00', duracaoMin: 30, unidadeId: 'u1', modalidade: 'online' },
]
const pagina = (conteudo, { pagina: p = 0, totalPaginas = 1 } = {}) => ({
  conteudo, pagina: p, tamanho: 5, totalElementos: conteudo.length, totalPaginas,
})
const AVALIACOES = [
  pagina([{ nota: 5, comentario: 'Muito atencioso.', autor: 'Ana F.', data: '2026-09-01' }], { totalPaginas: 2 }),
  pagina([{ nota: 4, comentario: 'Pontual.', autor: 'Caio M.', data: '2026-08-20' }], { pagina: 1, totalPaginas: 2 }),
]
const ESPECIALIDADES = [
  { id: 'e-clinico', slug: 'clinico-geral', nome: 'Clínico Geral', descricao: '' },
  { id: 'e-cardio', slug: 'cardiologia', nome: 'Cardiologia', descricao: '' },
]

/** Rotas públicas; `livres` são os horários que a API diz estarem livres. */
function rotasPublicas({ livres = LIVRES } = {}) {
  return {
    'GET /api/publico/profissionais': pagina([RESUMO]),
    'GET /api/publico/profissionais/c1': DETALHE,
    'GET /api/publico/profissionais/c1/horarios': ({ parametros }) =>
      parametros.get('de') ? livres.filter((h) => h.data === parametros.get('de')) : livres,
    'GET /api/publico/profissionais/c1/avaliacoes': ({ parametros }) => AVALIACOES[Number(parametros.get('pagina') ?? 0)],
    'GET /api/publico/especialidades': ESPECIALIDADES,
    'GET /api/publico/cidades': [{ nome: 'São Paulo', uf: 'SP', rotulo: 'São Paulo - SP' }],
    'GET /api/publico/convenios': [{ id: 'v1', nome: 'Unimed' }],
  }
}

/** Links por href (o seletor de atributo do jsdom falha com "?" e "&" no valor). */
const links = (filtro) => [...document.querySelectorAll('a[href]')].filter((a) => filtro(a.getAttribute('href')))

const cartoes = () => document.querySelectorAll('article[aria-labelledby^="pro-"]')

/* ------------------------------------------------------------ busca */

describe('busca', () => {
  test('com API: filtro da URL vai para a API e o cartão leva ao perfil e ao agendamento', async () => {
    const chamadas = apiFalsa(rotasPublicas())
    await aplicacao('/buscar?especialidade=cardiologia')

    await esperar(() => cartoes().length === 1, { mensagem: 'cartão da API' })
    const busca = chamadas.find((c) => c.caminho === '/api/publico/profissionais')
    assert.deepEqual(busca.parametros.getAll('especialidade'), ['cardiologia'])
    assert.equal(busca.parametros.get('cidade'), 'São Paulo')
    assert.ok(porTexto('1 profissional', 'h2'))
    assert.ok(porTexto('Para agendar, entre na sua conta', 'p'))
    assert.ok(document.querySelector('a[href="/profissionais/c1"]'))

    // Escolher um horário no cartão leva junto no link de agendamento.
    await clicar(porTexto('08:30', 'button', cartoes()[0]))
    const agendar = porTexto('Agendar consulta', 'a', cartoes()[0])
    assert.equal(agendar.getAttribute('href'), `/paciente/consultas?agendar=c1&data=${AMANHA}&horario=08%3A30`)
  })

  test('sem API: profissionais de demonstração, sem links de perfil', async () => {
    apiFalsa(null)
    await aplicacao('/buscar')

    await esperar(() => cartoes().length === 4, { mensagem: 'cartões de demonstração' })
    assert.ok(porTexto('Servidor indisponível', 'p'))
    assert.equal(document.querySelector('a[href^="/profissionais/"]'), null)
  })

  test('filtros contraditórios não chamam a API da busca', async () => {
    const chamadas = apiFalsa(rotasPublicas())
    const { container } = await aplicacao('/buscar?especialidade=cardiologia')
    await esperar(() => cartoes().length === 1)
    const antes = chamadas.filter((c) => c.caminho === '/api/publico/profissionais').length

    // Barra lateral só com Pediatria, painel com Cardiologia: nada a buscar.
    const pediatria = [...container.querySelectorAll('aside input[type="checkbox"]')]
      .find((el) => el.closest('label')?.textContent.includes('Pediatria'))
    await clicar(pediatria)
    await esperar(() => porTexto('Nenhum profissional encontrado', 'h3'))
    assert.equal(chamadas.filter((c) => c.caminho === '/api/publico/profissionais').length, antes)
  })
})

/* ------------------------------------------------------------ perfil */

describe('perfil do profissional', () => {
  test('mostra dados, horários como links de agendamento e só mapas https', async () => {
    apiFalsa(rotasPublicas())
    await aplicacao('/profissionais/c1')

    const titulo = await esperar(() => porTexto('Dr. Roberto Almeida', 'h1'), { mensagem: 'nome no h1' })
    assert.ok(titulo)
    assert.equal(document.querySelectorAll('h1').length, 1)
    assert.equal(window.document.title, 'SaúdePlus — Dr. Roberto Almeida')
    assert.ok(porTexto('Cardiologista há 15 anos.', 'p'))
    assert.ok(porTexto('R$', 'strong'))

    const agendamentos = links((href) => href.startsWith('/paciente/consultas?agendar=c1&data=')).map((a) => a.getAttribute('href'))
    assert.deepEqual(agendamentos, [
      `/paciente/consultas?agendar=c1&data=${AMANHA}&horario=08%3A00`,
      `/paciente/consultas?agendar=c1&data=${AMANHA}&horario=08%3A30`,
      `/paciente/consultas?agendar=c1&data=${DEPOIS}&horario=09%3A00`,
    ])

    const mapas = [...document.querySelectorAll('a[target="_blank"]')].map((a) => a.getAttribute('href'))
    assert.deepEqual(mapas, ['https://maps.example/paulista'])
  })

  test('"Ver mais avaliações" busca a próxima página e some na última', async () => {
    const chamadas = apiFalsa(rotasPublicas())
    await aplicacao('/profissionais/c1')
    await esperar(() => porTexto('Muito atencioso.', 'p'))

    await clicar(porTexto('Ver mais avaliações', 'button'))
    await esperar(() => porTexto('Pontual.', 'p'), { mensagem: 'segunda página' })
    assert.equal(porTexto('Ver mais avaliações', 'button'), null)
    const pedidas = chamadas.filter((c) => c.caminho.endsWith('/avaliacoes')).map((c) => c.parametros.get('pagina'))
    assert.deepEqual(pedidas, [null, '1'])
  })

  test('profissional inexistente: 404 vira "não encontrado"', async () => {
    apiFalsa({ 'GET /api/publico/profissionais/zz': { status: 404, corpo: { mensagem: 'Profissional não encontrado.' } } })
    await aplicacao('/profissionais/zz')
    await esperar(() => porTexto('Profissional não encontrado', 'h1'))
  })

  test('horários fora do ar não derrubam o perfil', async () => {
    apiFalsa({ ...rotasPublicas(), 'GET /api/publico/profissionais/c1/horarios': { status: 500, corpo: {} } })
    await aplicacao('/profissionais/c1')
    await esperar(() => porTexto('Dr. Roberto Almeida', 'h1'))
    assert.ok(porTexto('Não foi possível carregar os horários', 'p'))
  })

  test('servidor fora do ar: erro com "Tentar de novo", que recarrega', async () => {
    apiFalsa(null)
    await aplicacao('/profissionais/c1')
    await esperar(() => porTexto('Não foi possível carregar o perfil', 'h1'))

    apiFalsa(rotasPublicas())
    await clicar(porTexto('Tentar de novo', 'button'))
    await esperar(() => porTexto('Dr. Roberto Almeida', 'h1'), { mensagem: 'perfil depois de tentar de novo' })
  })
})

/* ------------------------------------------------------------ destaques */

describe('profissionais em destaque', () => {
  test('com API, os mais bem avaliados com link para o perfil', async () => {
    const chamadas = apiFalsa(rotasPublicas())
    await aplicacao('/especialidades')
    await esperar(() => document.querySelector('a[href="/profissionais/c1"]'), { mensagem: 'link do destaque' })
    const destaques = chamadas.find((c) => c.caminho === '/api/publico/profissionais')
    assert.equal(destaques.parametros.get('ordem'), 'avaliacao')
    assert.equal(destaques.parametros.get('tamanho'), '4')
  })

  test('sem API, os de demonstração buscam pelo nome', async () => {
    apiFalsa(null)
    await aplicacao('/especialidades')
    await esperar(() => links((href) => href === '/buscar?q=Dr.%20Roberto%20Almeida')[0])
    assert.equal(document.querySelector('a[href^="/profissionais/"]'), null)
  })
})

/* ------------------------------------------------------------ agendar */

const PACIENTE = { id: 'p1', nomeCompleto: 'Ana Paula Ferreira', email: 'ana@x.com', telefone: null, role: 'PACIENTE' }

/** API pública + login + área do paciente. `reservas` recebe o corpo de cada POST de agendamento. */
function rotasDoFluxo({ livres, reservas = [] } = {}) {
  return {
    ...rotasPublicas({ livres }),
    'POST /api/auth/login': { token: 'tok-paciente', tipo: 'Bearer', expiraEmSegundos: 28800, usuario: PACIENTE },
    'GET /api/auth/perfil': PACIENTE,
    'GET /api/paciente/agendamentos': [],
    'POST /api/paciente/agendamentos': ({ corpo }) => {
      reservas.push(corpo)
      return { status: 201, corpo: { id: 'a1', status: 'pendente' } }
    },
  }
}

const modal = () => document.querySelector('[role="dialog"]')
const campoDoModal = (rotulo) => {
  const label = porTexto(rotulo, 'label', modal())
  return label && document.getElementById(label.getAttribute('for'))
}

async function entrarComoPaciente() {
  const formulario = document.querySelector('form')
  await digitar(formulario.querySelector('input[type="email"]'), 'ana@x.com')
  await digitar(formulario.querySelector('input[type="password"]'), 'umaSenhaForte1')
  await enviar(formulario)
}

describe('agendar pelo perfil', () => {
  test('visitante → login → volta ao agendamento preenchido → reserva', async () => {
    const reservas = []
    const chamadas = apiFalsa(rotasDoFluxo({ reservas }))
    const tela = await aplicacao('/profissionais/c1')
    await esperar(() => porTexto('Dr. Roberto Almeida', 'h1'))

    // Horário do perfil → rota protegida → login, com o destino guardado.
    await clicar(links((href) => href === `/paciente/consultas?agendar=c1&data=${AMANHA}&horario=08%3A30`)[0])
    await esperar(() => tela.onde() === '/login', { mensagem: 'redirecionar para o login' })
    assert.match(window.sessionStorage.getItem('saudeplus:destino'), /agendar=c1/)

    await entrarComoPaciente()
    await esperar(() => tela.onde().startsWith('/paciente/consultas?agendar=c1'), { mensagem: 'voltar ao agendamento' })

    // O modal abre com especialidade, médico, dia e horário já escolhidos.
    await esperar(() => modal() && campoDoModal('Médico')?.value === 'c1', { mensagem: 'modal preenchido' })
    assert.equal(porTexto('Agendar consulta', 'h2', modal()).textContent, 'Agendar consulta')
    assert.equal(campoDoModal('Especialidade').value, 'e-cardio')
    assert.equal(campoDoModal('Especialidade').disabled, false, 'continua editável')
    assert.equal(campoDoModal('Data').value, AMANHA)
    const horario = await esperar(() => porTexto('08:30', 'button[aria-pressed="true"]', modal()), { mensagem: 'horário marcado' })
    assert.ok(horario)
    // O destino já foi usado: um login futuro não volta para cá.
    assert.equal(window.sessionStorage.getItem('saudeplus:destino'), null)

    await enviar(modal().querySelector('form'))
    await esperar(() => !modal(), { mensagem: 'modal fechar depois da reserva' })
    assert.deepEqual(reservas, [{
      medicoId: 'c1', especialidadeId: 'e-cardio', data: AMANHA, horario: '08:30', modalidade: 'presencial',
    }])
    assert.equal(tela.onde(), '/paciente/consultas')
    assert.ok(porTexto('agendada para', '[role="status"]'))
    const post = chamadas.find((c) => c.metodo === 'POST' && c.caminho === '/api/paciente/agendamentos')
    assert.equal(post.headers.Authorization, 'Bearer tok-paciente')
  })

  test('horário que já não está livre não é enviado', async () => {
    const reservas = []
    // A API do dia só tem 08:00: o 08:30 do link foi reservado por outra pessoa.
    apiFalsa(rotasDoFluxo({ reservas, livres: [LIVRES[0]] }))
    window.sessionStorage.setItem('saudeplus:token', 'tok-paciente')
    await aplicacao(`/paciente/consultas?agendar=c1&data=${AMANHA}&horario=08:30`)

    await esperar(() => modal() && campoDoModal('Médico')?.value === 'c1', { mensagem: 'modal preenchido' })
    await esperar(() => porTexto('08:00', 'button', modal()), { mensagem: 'horários do dia' })
    await enviar(modal().querySelector('form'))
    await esperar(() => porTexto('Esse horário não está livre', 'p', modal()))
    assert.deepEqual(reservas, [])
  })

  test('fechar o modal limpa o pedido da URL', async () => {
    apiFalsa(rotasDoFluxo())
    window.sessionStorage.setItem('saudeplus:token', 'tok-paciente')
    const tela = await aplicacao('/paciente/consultas?agendar=c1')

    await esperar(() => modal() && campoDoModal('Médico')?.value === 'c1')
    assert.equal(campoDoModal('Data').value, '')
    await clicar(porTexto('Cancelar', 'button', modal()))
    await esperar(() => !modal())
    assert.equal(tela.onde(), '/paciente/consultas')
  })

  test('médico logado não é levado ao agendamento de paciente', async () => {
    apiFalsa({ ...rotasDoFluxo(), 'GET /api/auth/perfil': { ...PACIENTE, role: 'MEDICO' }, 'GET /api/medico/painel': { status: 500, corpo: {} } })
    window.sessionStorage.setItem('saudeplus:token', 'tok-medico')
    const tela = await aplicacao('/paciente/consultas?agendar=c1')
    await esperar(() => tela.onde() === '/medico', { mensagem: 'ir para a área do médico' })
  })
})

/* ------------------------------------------------------------ sessão */

describe('sessão recusada pelo servidor', () => {
  test('token recusado no meio do uso leva ao login, sem dados de demonstração, e guarda a tela', async () => {
    // O perfil ainda valida, mas o token vence antes da chamada da tela.
    apiFalsa({ ...rotasDoFluxo(), 'GET /api/paciente/agendamentos': { status: 401, corpo: { mensagem: 'Token expirado.' } } })
    window.sessionStorage.setItem('saudeplus:token', 'tok-paciente')
    const tela = await aplicacao('/paciente/consultas')

    await esperar(() => tela.onde() === '/login', { mensagem: 'ir para o login' })
    assert.equal(window.sessionStorage.getItem('saudeplus:token'), null)
    assert.equal(JSON.parse(window.sessionStorage.getItem('saudeplus:destino')).caminho, '/paciente/consultas')
    assert.equal(porTexto('Mostrando dados de demonstração'), null)
  })
})
