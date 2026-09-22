import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth.context.js'
import { rotaInicialDe } from '../features/auth/auth.rotas.js'

/**
 * Impede que quem ja esta logado veja as telas de login e cadastro de novo:
 * manda direto para a area do perfil.
 */
export default function SomenteVisitante({ children }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return <p className="sp-carregando">Carregando...</p>
  }

  if (usuario) {
    return <Navigate to={rotaInicialDe(usuario)} replace />
  }

  return children
}
