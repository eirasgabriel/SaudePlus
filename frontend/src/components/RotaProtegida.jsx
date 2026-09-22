import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth.context.js'
import { rotaInicialDe } from '../features/auth/auth.rotas.js'

/**
 * Libera a rota apenas para quem esta autenticado e, opcionalmente, apenas para
 * certos perfis.
 *
 * Isto e conveniencia de navegacao, nao seguranca: a autorizacao de verdade esta
 * no SecurityConfig do back-end. Um usuario pode alterar o que quiser no
 * navegador; a API continua recusando.
 *
 * @param {object} props
 * @param {string[]} [props.permitir]  perfis aceitos, ex.: ['ADMIN']
 */
export default function RotaProtegida({ permitir, children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return <p className="sp-carregando">Carregando...</p>
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (permitir && !permitir.includes(usuario.role)) {
    return <Navigate to={rotaInicialDe(usuario)} replace />
  }

  return children
}
