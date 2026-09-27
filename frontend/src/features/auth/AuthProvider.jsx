import { useCallback, useEffect, useMemo, useState } from 'react'
import { lerToken, limparToken, salvarToken } from '../../services/sessaoStorage.js'
import { autenticar, buscarPerfil, cadastrarPaciente } from './auth.api.js'
import { AuthContext } from './auth.context.js'

/**
 * Mantem o usuario autenticado disponivel para a aplicacao inteira.
 *
 * Ao montar, se existe token guardado, ele e revalidado em /api/auth/perfil.
 * Token expirado ou invalido e descartado em silencio e o usuario volta ao login.
 */
export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  // Só há o que carregar quando existe token guardado. O valor sai daqui, e não
  // de um setState dentro do efeito: além de evitar um render extra, é o que a
  // regra react-hooks/set-state-in-effect exige.
  const [carregando, setCarregando] = useState(() => Boolean(lerToken()))

  useEffect(() => {
    // Sem token guardado não há o que revalidar: evita um 401 na primeira visita.
    if (!lerToken()) {
      return undefined
    }

    let ativo = true

    buscarPerfil()
      .then((perfil) => {
        if (ativo) {
          setUsuario(perfil)
        }
      })
      .catch(() => {
        limparToken()
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false)
        }
      })

    return () => {
      ativo = false
    }
  }, [])

  const entrar = useCallback(async ({ email, senha, lembrar = true }) => {
    const resposta = await autenticar({ email, senha })
    salvarToken(resposta.token, { lembrar })
    setUsuario(resposta.usuario)
    return resposta.usuario
  }, [])

  /**
   * Cria a conta e devolve a resposta da API sem abrir a sessão.
   *
   * A sessão fica para o `aplicarSessao`, chamado quando o usuário sai da tela
   * de "conta criada com sucesso". Se autenticasse aqui, o `SomenteVisitante`
   * redirecionaria na mesma hora e a mensagem de sucesso nunca apareceria.
   */
  const registrar = useCallback(async (dados) => cadastrarPaciente(dados), [])

  /** Abre a sessão a partir de uma resposta de cadastro já concluída. */
  const aplicarSessao = useCallback((resposta, { lembrar = true } = {}) => {
    salvarToken(resposta.token, { lembrar })
    setUsuario(resposta.usuario)
    return resposta.usuario
  }, [])

  const sair = useCallback(() => {
    limparToken()
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, registrar, aplicarSessao, sair }),
    [usuario, carregando, entrar, registrar, aplicarSessao, sair],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
