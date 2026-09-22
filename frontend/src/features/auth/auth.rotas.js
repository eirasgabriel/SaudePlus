/** Para onde cada perfil vai depois de autenticar. */
export const ROTA_INICIAL_POR_ROLE = {
  PACIENTE: '/paciente',
  MEDICO: '/medico',
  ADMIN: '/admin',
}

/** Rotulo exibido na interface para cada perfil. */
export const ROTULO_POR_ROLE = {
  PACIENTE: 'Paciente',
  MEDICO: 'Profissional de saude',
  ADMIN: 'Administracao',
}

export function rotaInicialDe(usuario) {
  return ROTA_INICIAL_POR_ROLE[usuario?.role] ?? '/login'
}
