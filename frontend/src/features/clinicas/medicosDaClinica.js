import { http } from '../../services/http.js';

/** Corpo clínico da unidade da conta logada. O servidor deriva a unidade do token. */
export const listarMedicosDaClinica = ({ sinal }) =>
  http.get('/api/clinica/medicos', { sinal, autenticado: true });

/** Médicos ativos ainda não vinculados, por nome ou CRM (mínimo de 2 caracteres). */
export const buscarMedicosParaVincular = (busca, { sinal } = {}) =>
  http.get('/api/clinica/medicos/disponiveis', { parametros: { busca }, sinal, autenticado: true });

export const vincularMedico = (medicoId) =>
  http.post('/api/clinica/medicos', { medicoId }, { autenticado: true });

export const desvincularMedico = (medicoId) =>
  http.remover(`/api/clinica/medicos/${encodeURIComponent(medicoId)}`, { autenticado: true });
