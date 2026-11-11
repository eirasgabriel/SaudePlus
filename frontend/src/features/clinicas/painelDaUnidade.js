import * as api from '../admin/admin.api.js';
import { http } from '../../services/http.js';

export const carregarClinicaLogada = ({ sinal }) => http.get('/api/clinica/painel', { sinal, autenticado: true });

/** A data do painel segue o mesmo fuso da agenda no servidor. */
export function hojeNaClinica(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(agora);
  const obter = (tipo) => partes.find((p) => p.type === tipo).value;
  return `${obter('year')}-${obter('month')}-${obter('day')}`;
}

export function dataValida(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor ?? '') &&
    !Number.isNaN(Date.parse(`${valor}T12:00:00Z`)) &&
    new Date(`${valor}T12:00:00Z`).toISOString().slice(0, 10) === valor;
}

/** Percorre as páginas para que os indicadores nunca contem só a primeira. */
export async function carregarAgendaDaUnidade({ unidadeId, data, sinal, acessoClinica = false }) {
  const consultas = [];
  let pagina = 0;
  let totalPaginas;
  do {
    const resposta = acessoClinica ? await http.get('/api/clinica/agendamentos', {
      parametros: { de: data, ate: data, pagina, tamanho: 500 }, sinal, autenticado: true,
    }) : await api.listarAgendamentos({
      unidadeId, de: data, ate: data, pagina, tamanho: 500, sinal,
    });
    consultas.push(...resposta.conteudo);
    totalPaginas = resposta.totalPaginas;
    pagina += 1;
  } while (pagina < totalPaginas);
  return consultas.sort((a, b) => a.horario.localeCompare(b.horario));
}

export function resumoDaUnidade(consultas) {
  return {
    consultas: consultas.length,
    realizadas: consultas.filter((c) => c.status === 'realizada').length,
    aguardando: consultas.filter((c) => c.status === 'aguardando').length,
    emAtendimento: consultas.filter((c) => c.status === 'em_andamento').length,
  };
}

export function profissionaisDoDia(consultas) {
  const profissionais = new Map();
  for (const consulta of consultas) {
    const { medico, especialidade, status } = consulta;
    if (['cancelada', 'faltou'].includes(status)) continue;
    if (!profissionais.has(medico.id)) {
      profissionais.set(medico.id, { ...medico, especialidades: new Set(), consultas: 0 });
    }
    const profissional = profissionais.get(medico.id);
    profissional.consultas += 1;
    profissional.especialidades.add(especialidade);
  }
  return [...profissionais.values()].map((p) => ({ ...p, especialidades: [...p.especialidades].join(', ') }));
}
