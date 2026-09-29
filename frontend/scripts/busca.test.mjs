// Regras puras da busca de profissionais (features/profissionais/buscaParametros.js):
// URL → consulta, consulta → parâmetros da API, resposta → cartão e o filtro
// local usado quando a API não responde. Os mocks importam ícones e imagens,
// então o módulo é carregado pelo Vite.
import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import { createServer } from 'vite'

let server
let busca

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  busca = await server.ssrLoadModule('/src/features/profissionais/buscaParametros.js')
})

after(async () => { await server?.close() })

const SEM_FILTROS = { types: [], specialties: [], insurances: [], allInsurances: false }
const PADRAO = { term: '', city: 'São Paulo - SP', specialty: '', type: '' }

function consulta({ applied = {}, filters = {}, sort = 'relevancia' } = {}) {
  return { applied: { ...PADRAO, ...applied }, filters: { ...SEM_FILTROS, ...filters }, sort }
}

describe('URL → consulta', () => {
  const ler = (query) => busca.lerConsultaDaUrl(new URLSearchParams(query))

  test('sem parâmetros, painel vazio na primeira cidade', () => {
    assert.deepEqual(ler(''), PADRAO)
  })

  test('especialidade do catálogo ignora acento e caixa', () => {
    assert.equal(ler('especialidade=clinico%20geral').specialty, 'Clínico Geral')
    assert.equal(ler('especialidade=clinico%20geral').term, '')
  })

  test('especialidade fora do catálogo vira termo de busca', () => {
    assert.deepEqual(ler('especialidade=Geriatria'), { ...PADRAO, term: 'Geriatria' })
  })

  test('q vale mais que a especialidade desconhecida', () => {
    assert.equal(ler('q=ana&especialidade=Geriatria').term, 'ana')
  })

  test('cidade só no formato "Cidade - UF", inclusive fora da lista local', () => {
    assert.equal(ler('cidade=Saquarema%20-%20RJ').city, 'Saquarema - RJ')
    assert.equal(ler('cidade=Saquarema').city, 'São Paulo - SP')
    assert.equal(ler('cidade=Saquarema%20-%20rj').city, 'São Paulo - SP')
  })

  test('tipo só entre as modalidades conhecidas', () => {
    assert.equal(ler('tipo=domiciliar').type, 'domiciliar')
    assert.equal(ler('tipo=teleporte').type, '')
  })
})

describe('consulta → parâmetros da API', () => {
  test('sem filtros', () => {
    assert.deepEqual(busca.montarParametros(consulta(), 50), {
      q: undefined, cidade: 'São Paulo', uf: 'SP', especialidade: [], modalidade: [],
      convenio: [], ordem: 'relevancia', tamanho: 50,
    })
  })

  test('termo sem espaços nas pontas; termo em branco não vai', () => {
    assert.equal(busca.montarParametros(consulta({ applied: { term: '  ana  ' } })).q, 'ana')
    assert.equal(busca.montarParametros(consulta({ applied: { term: '   ' } })).q, undefined)
  })

  test('especialidade vai como slug; nome desconhecido vai como está', () => {
    const p = busca.montarParametros(consulta({ filters: { specialties: ['Clínico Geral', 'Nutrição', 'Geriatria'] } }))
    assert.deepEqual(p.especialidade, ['clinico-geral', 'nutricao', 'Geriatria'])
  })

  test('painel e barra lateral compatíveis viram um valor só', () => {
    const p = busca.montarParametros(consulta({
      applied: { specialty: 'Pediatria', type: 'online' },
      filters: { specialties: ['Pediatria', 'Cardiologia'], types: ['online', 'presencial'] },
    }))
    assert.deepEqual(p.especialidade, ['pediatria'])
    assert.deepEqual(p.modalidade, ['online'])
  })

  test('painel e barra lateral contraditórios não buscam nada', () => {
    assert.equal(busca.montarParametros(consulta({
      applied: { specialty: 'Cardiologia' }, filters: { specialties: ['Pediatria'] },
    })), null)
    assert.equal(busca.montarParametros(consulta({
      applied: { type: 'domiciliar' }, filters: { types: ['online'] },
    })), null)
  })

  test('convênios e ordem passam direto', () => {
    const p = busca.montarParametros(consulta({ filters: { insurances: ['Unimed'] }, sort: 'avaliacao' }))
    assert.deepEqual(p.convenio, ['Unimed'])
    assert.equal(p.ordem, 'avaliacao')
  })

  test('separarCidade usa o último " - " (cidades com hífen no nome)', () => {
    assert.deepEqual(busca.separarCidade('Embu - Guaçu - SP'), { cidade: 'Embu - Guaçu', uf: 'SP' })
    assert.deepEqual(busca.separarCidade('Saquarema'), { cidade: 'Saquarema', uf: undefined })
  })
})

describe('resposta da API → cartão', () => {
  const DA_API = {
    id: 'c1', nome: 'Dr. Roberto Almeida', fotoUrl: '/f.jpg', crm: '123.456', crmUf: 'SP',
    especialidades: [{ slug: 'cardiologia', nome: 'Cardiologia' }, { slug: 'clinico-geral', nome: 'Clínico Geral' }],
    nota: '4.90', avaliacoes: 328,
    local: { endereco: 'Av. Paulista, 1000', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
    modalidades: ['presencial'], convenios: ['Unimed'],
    proximaData: '2026-09-29', proximosHorarios: ['08:00', '08:30'],
  }

  test('converte para o formato do ProfessionalCard', () => {
    assert.deepEqual(busca.paraCartao(DA_API), {
      id: 'c1', name: 'Dr. Roberto Almeida', specialty: 'Cardiologia, Clínico Geral', crm: 'CRM 123.456-SP',
      rating: 4.9, reviews: 328, address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      city: 'São Paulo - SP', types: ['presencial'], insurances: ['Unimed'],
      slots: ['08:00', '08:30'], slotsDate: '2026-09-29', photo: '/f.jpg',
    })
  })

  test('sem bairro, o endereço não ganha hífen sobrando', () => {
    const c = busca.paraCartao({ ...DA_API, local: { ...DA_API.local, bairro: null } })
    assert.equal(c.address, 'Av. Paulista, 1000, São Paulo - SP')
  })

  test('sem unidade, endereço e cidade ficam vazios', () => {
    const c = busca.paraCartao({ ...DA_API, local: null })
    assert.equal(c.address, '')
    assert.equal(c.city, '')
  })
})

describe('sem API: filtro dos mocks', () => {
  const nomes = (c) => busca.filtrarMocks(consulta(c)).map((p) => p.name.replace(/^Dra?\. /, ''))

  for (const [descricao, c, esperado] of [
    ['sem filtros', {}, ['Roberto Almeida', 'Juliana Castro', 'Marcelo Santos', 'Fernanda Lima']],
    ['termo na especialidade', { applied: { term: 'cardiologia' } }, ['Roberto Almeida']],
    ['termo no nome, sem caixa', { applied: { term: 'JULIANA' } }, ['Juliana Castro']],
    ['especialidade do painel', { applied: { specialty: 'Ginecologia' } }, ['Fernanda Lima']],
    ['cidade', { applied: { city: 'Rio de Janeiro - RJ' } }, []],
    ['modalidade', { applied: { type: 'domiciliar' } }, []],
    ['especialidades da barra', { filters: { specialties: ['Pediatria', 'Dermatologia'] } }, ['Juliana Castro', 'Marcelo Santos']],
    ['convênio', { filters: { insurances: ['SulAmérica'] } }, ['Juliana Castro', 'Marcelo Santos']],
    ['termo sem resultado', { applied: { term: 'nenhum-resultado' } }, []],
  ]) {
    test(descricao, () => assert.deepEqual(nomes(c), esperado))
  }

  test('ordena por avaliação e, no empate, por número de avaliações', () => {
    assert.deepEqual(nomes({ sort: 'avaliacao' }), ['Marcelo Santos', 'Roberto Almeida', 'Fernanda Lima', 'Juliana Castro'])
  })

  test('ordena pelo nome completo, com o título', () => {
    const ordem = busca.filtrarMocks(consulta({ sort: 'nome' })).map((p) => p.name)
    assert.deepEqual(ordem, ['Dr. Marcelo Santos', 'Dr. Roberto Almeida', 'Dra. Fernanda Lima', 'Dra. Juliana Castro'])
  })
})
