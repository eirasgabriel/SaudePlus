// Perfil do profissional e o caminho do "Agendar consulta" até a área do
// paciente: features/profissionais/perfil.js e features/auth/destinoPendente.js.
// Os dois módulos não importam nada, então rodam direto, sem o Vite.
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  agruparHorarios, linkDeAgendamento, lerPedidoDeAgendamento, paraDestaque, paraPerfil, rotuloDoDia,
} from '../src/features/profissionais/perfil.js'
import {
  VALIDADE_MS, descartarDestino, destinoPendente, guardarDestino,
} from '../src/features/auth/destinoPendente.js'

describe('perfil', () => {
  const DA_API = {
    id: 'c1', nome: 'Dr. Roberto Almeida', fotoUrl: null, crm: '123.456', crmUf: 'SP', bio: '  Cardiologista.  ',
    especialidades: [{ slug: 'cardiologia', nome: 'Cardiologia' }],
    nota: '4.90', avaliacoes: 328, valorConsulta: '250.00',
    modalidades: ['presencial', 'online'], convenios: ['Unimed'],
    unidades: [{
      id: 'u1', nome: 'Paulista', endereco: 'Av. Paulista, 1000', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP',
      telefone: null, horarioFuncionamento: 'Seg a sex', mapUrl: 'https://maps.example/x',
    }],
  }

  test('converte a resposta da API', () => {
    const p = paraPerfil(DA_API)
    assert.equal(p.crm, 'CRM 123.456-SP')
    assert.equal(p.bio, 'Cardiologista.')
    assert.equal(p.nota, 4.9)
    assert.match(p.valorConsulta, /^R\$\s250,00$/)
    assert.deepEqual(p.modalidades, [
      { id: 'presencial', rotulo: 'Consulta presencial' },
      { id: 'online', rotulo: 'Consulta on-line' },
    ])
    assert.deepEqual(p.unidades[0], {
      id: 'u1', nome: 'Paulista', endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      telefone: null, horario: 'Seg a sex', mapUrl: 'https://maps.example/x',
    })
  })

  test('sem valor, bio ou nota: nada de "R$ NaN", bio vazia ou nota indefinida', () => {
    const p = paraPerfil({ ...DA_API, valorConsulta: null, bio: '   ', nota: null, avaliacoes: undefined })
    assert.equal(p.valorConsulta, null)
    assert.equal(p.bio, null)
    assert.equal(p.nota, 0)
    assert.equal(p.avaliacoes, 0)
  })

  test('modalidade desconhecida passa com o nome cru', () => {
    assert.deepEqual(paraPerfil({ ...DA_API, modalidades: ['hibrida'] }).modalidades, [{ id: 'hibrida', rotulo: 'hibrida' }])
  })

  test('horários agrupados por dia, em ordem, sem repetir o mesmo horário de duas modalidades', () => {
    const livres = [
      { data: '2026-09-30', horario: '09:00' },
      { data: '2026-09-29', horario: '10:00', modalidade: 'presencial' },
      { data: '2026-09-29', horario: '08:30' },
      { data: '2026-09-29', horario: '10:00', modalidade: 'online' },
    ]
    assert.deepEqual(agruparHorarios(livres), [
      { data: '2026-09-29', horarios: ['08:30', '10:00'] },
      { data: '2026-09-30', horarios: ['09:00'] },
    ])
  })

  test('horários: no máximo `maxDias` dias', () => {
    const livres = ['01', '02', '03', '04', '05', '06', '07'].map((d) => ({ data: `2026-10-${d}`, horario: '08:00' }))
    assert.deepEqual(agruparHorarios(livres).map((d) => d.data), ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'])
    assert.equal(agruparHorarios(livres, 2).length, 2)
    assert.deepEqual(agruparHorarios([]), [])
  })

  test('rótulo do dia: hoje, amanhã (inclusive na virada do mês) e dia da semana', () => {
    const agora = new Date(2026, 8, 30, 23, 50)
    assert.equal(rotuloDoDia('2026-09-30', agora), 'hoje')
    assert.equal(rotuloDoDia('2026-10-01', agora), 'amanhã')
    assert.equal(rotuloDoDia('2026-10-02', agora), 'sex., 02/10')
    assert.equal(rotuloDoDia(null, agora), '')
  })
})

describe('profissionais em destaque', () => {
  test('cartão com link para o perfil; sem foto nem especialidade, sem undefined', () => {
    assert.deepEqual(paraDestaque({
      id: 'c 1', nome: 'Dra. Ana', especialidades: [{ slug: 'pediatria', nome: 'Pediatria' }, { slug: 'x', nome: 'X' }],
      nota: '4.50', avaliacoes: 12, fotoUrl: '/f.jpg',
    }), { id: 'c 1', name: 'Dra. Ana', specialty: 'Pediatria', rating: 4.5, reviews: 12, photo: '/f.jpg', perfilHref: '/profissionais/c%201' })
    const vazio = paraDestaque({ id: 'c2', nome: 'Dr. B', especialidades: [], nota: null, avaliacoes: null, fotoUrl: null })
    assert.equal(vazio.specialty, '')
    assert.equal(vazio.rating, 0)
    assert.equal(vazio.reviews, 0)
    assert.equal(vazio.photo, null)
  })
})

describe('pedido de agendamento', () => {
  const ler = (link) => lerPedidoDeAgendamento(new URL(link, 'http://x').searchParams)

  test('link só com o médico', () => {
    assert.equal(linkDeAgendamento('c1'), '/paciente/consultas?agendar=c1')
    assert.deepEqual(ler(linkDeAgendamento('c1')), { medicoId: 'c1', data: '', horario: '' })
  })

  test('ida e volta com dia e horário', () => {
    const link = linkDeAgendamento('c1', { data: '2026-09-29', horario: '08:30' })
    assert.equal(link, '/paciente/consultas?agendar=c1&data=2026-09-29&horario=08%3A30')
    assert.deepEqual(ler(link), { medicoId: 'c1', data: '2026-09-29', horario: '08:30' })
  })

  test('o id é codificado: não escapa do parâmetro', () => {
    assert.deepEqual(ler(linkDeAgendamento('a&data=x')), { medicoId: 'a&data=x', data: '', horario: '' })
  })

  test('horário sem dia, ou fora do formato, é descartado', () => {
    assert.equal(linkDeAgendamento('c1', { horario: '08:30' }), '/paciente/consultas?agendar=c1')
    assert.equal(linkDeAgendamento('c1', { data: '29/09/2026', horario: '08:30' }), '/paciente/consultas?agendar=c1')
    assert.deepEqual(ler('/paciente/consultas?agendar=c1&data=2026-09-29&horario=25:00'), { medicoId: 'c1', data: '2026-09-29', horario: '' })
    assert.deepEqual(ler('/paciente/consultas?agendar=c1&horario=08:30'), { medicoId: 'c1', data: '', horario: '' })
  })

  test('sem "agendar" (ou em branco), não há pedido', () => {
    assert.equal(ler('/paciente/consultas'), null)
    assert.equal(ler('/paciente/consultas?agendar=%20'), null)
  })
})

describe('volta ao destino depois do login', () => {
  function memoria() {
    const itens = new Map()
    return {
      getItem: (k) => (itens.has(k) ? itens.get(k) : null),
      setItem: (k, v) => itens.set(k, String(v)),
      removeItem: (k) => itens.delete(k),
    }
  }
  const paciente = { role: 'PACIENTE' }
  const medico = { role: 'MEDICO' }
  const destino = '/paciente/consultas?agendar=c1'

  test('guarda e devolve o destino para um perfil permitido', () => {
    const armazenamento = memoria()
    guardarDestino(destino, ['PACIENTE'], { armazenamento, agora: 1000 })
    assert.equal(destinoPendente(paciente, { armazenamento, agora: 2000 }), destino)
  })

  test('perfil sem permissão, ou sem usuário, não usa o destino', () => {
    const armazenamento = memoria()
    guardarDestino(destino, ['PACIENTE'], { armazenamento, agora: 1000 })
    assert.equal(destinoPendente(medico, { armazenamento, agora: 2000 }), null)
    assert.equal(destinoPendente(null, { armazenamento, agora: 2000 }), null)
  })

  test('sem lista de perfis, vale para qualquer um logado', () => {
    const armazenamento = memoria()
    guardarDestino('/qualquer', undefined, { armazenamento, agora: 0 })
    assert.equal(destinoPendente(medico, { armazenamento, agora: 1 }), '/qualquer')
  })

  test('expira em 30 minutos', () => {
    const armazenamento = memoria()
    guardarDestino(destino, ['PACIENTE'], { armazenamento, agora: 0 })
    assert.equal(destinoPendente(paciente, { armazenamento, agora: VALIDADE_MS - 1 }), destino)
    assert.equal(destinoPendente(paciente, { armazenamento, agora: VALIDADE_MS }), null)
  })

  test('não guarda endereço externo (redirecionamento aberto)', () => {
    const armazenamento = memoria()
    for (const externo of ['//evil.example', 'https://evil.example', 'javascript:alert(1)', '']) {
      guardarDestino(externo, null, { armazenamento, agora: 0 })
      assert.equal(destinoPendente(paciente, { armazenamento, agora: 1 }), null, externo)
    }
  })

  test('valor adulterado no storage é ignorado', () => {
    const armazenamento = memoria()
    armazenamento.setItem('saudeplus:destino', '{"caminho":"//evil.example","perfis":null,"guardadoEm":0}')
    assert.equal(destinoPendente(paciente, { armazenamento, agora: 1 }), null)
    armazenamento.setItem('saudeplus:destino', 'não é json')
    assert.equal(destinoPendente(paciente, { armazenamento, agora: 1 }), null)
  })

  test('descartar com caminho só apaga se for o mesmo destino', () => {
    const armazenamento = memoria()
    guardarDestino(destino, ['PACIENTE'], { armazenamento, agora: 0 })
    descartarDestino('/paciente', { armazenamento })
    assert.equal(destinoPendente(paciente, { armazenamento, agora: 1 }), destino)
    descartarDestino(destino, { armazenamento })
    assert.equal(destinoPendente(paciente, { armazenamento, agora: 1 }), null)
  })

  test('sem storage disponível, nada quebra', () => {
    const quebrado = {
      getItem() { throw new Error('bloqueado') },
      setItem() { throw new Error('bloqueado') },
      removeItem() { throw new Error('bloqueado') },
    }
    guardarDestino(destino, ['PACIENTE'], { armazenamento: quebrado })
    assert.equal(destinoPendente(paciente, { armazenamento: quebrado }), null)
    descartarDestino(undefined, { armazenamento: quebrado })
  })
})
