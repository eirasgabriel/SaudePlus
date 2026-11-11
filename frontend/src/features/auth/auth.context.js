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

/**
 * Igual a useAuth, mas fora do <AuthProvider> (telas públicas renderizadas
 * sozinhas, como nos testes) devolve "ninguém logado" em vez de falhar.
 */
export function useAuthOpcional() {
  return useContext(AuthContext) ?? { usuario: null, sair: () => {} }
}
