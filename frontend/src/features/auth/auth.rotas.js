import { destinoPendente } from './destinoPendente.js'

/** Para onde cada perfil vai depois de autenticar. */
export const ROTA_INICIAL_POR_ROLE = {
  PACIENTE: '/paciente',
  MEDICO: '/medico',
  ADMIN: '/admin',
  // Equipe da clínica: entra no admin e vê só os módulos liberados na matriz de permissões.
  GESTOR: '/admin',
  ENFERMEIRO: '/admin',
  RECEPCIONISTA: '/admin',
  AGENTE: '/admin',
}

/** Rotulo exibido na interface para cada perfil. */
export const ROTULO_POR_ROLE = {
  PACIENTE: 'Paciente',
  MEDICO: 'Profissional de saude',
  ADMIN: 'Administracao',
  GESTOR: 'Gestao',
  ENFERMEIRO: 'Enfermagem',
  RECEPCIONISTA: 'Recepcao',
  AGENTE: 'Agente comunitario',
}

/**
 * Para onde ir depois de autenticar: o destino guardado antes do login (ver
 * destinoPendente.js), se o perfil puder abri-lo; senão, a área do perfil.
 */
export function rotaInicialDe(usuario) {
  return destinoPendente(usuario) ?? ROTA_INICIAL_POR_ROLE[usuario?.role] ?? '/login'
}
