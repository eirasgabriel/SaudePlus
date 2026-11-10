import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/auth.context.js'
import { rotaInicialDe } from '../features/auth/auth.rotas.js'
import { descartarDestino, guardarDestino } from '../features/auth/destinoPendente.js'

/**
 * Libera a rota apenas para quem esta autenticado e, opcionalmente, apenas para
 * certos perfis.
 *
 * Isto e conveniencia de navegacao, nao seguranca: a autorizacao de verdade esta
 * no SecurityConfig do back-end. Um usuario pode alterar o que quiser no
 * navegador; a API continua recusando.
 *
 * Sem login, guarda o endereço pedido (ver destinoPendente.js): depois de
 * entrar, a pessoa volta para ele em vez de cair na área inicial.
 *
 * @param {object} props
 * @param {string[]} [props.permitir]  perfis aceitos, ex.: ['ADMIN']
 */
export default function RotaProtegida({ permitir, children }) {
  const { usuario, carregando } = useAuth()
  const { pathname, search } = useLocation()
  const endereco = pathname + search
  const liberado = Boolean(usuario) && (!permitir || permitir.includes(usuario.role))

  useEffect(() => {
    // Chegou: o destino guardado antes do login já foi usado.
    if (liberado) descartarDestino(endereco)
  }, [liberado, endereco])

  if (carregando) {
    return <p className="sp-carregando">Carregando...</p>
  }

  if (!usuario) {
    guardarDestino(endereco, permitir)
    return <Navigate to="/login" replace />
  }

  if (!liberado) {
    return <Navigate to={rotaInicialDe(usuario)} replace />
  }

  return children
}
