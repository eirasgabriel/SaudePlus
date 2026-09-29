import { createContext, useContext } from 'react'

/**
 * Contexto de autenticacao.
 *
 * Fica separado do provider porque o Fast Refresh do Vite exige que um arquivo
 * .jsx exporte apenas componentes.
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>.')
  }
  return contexto
}
