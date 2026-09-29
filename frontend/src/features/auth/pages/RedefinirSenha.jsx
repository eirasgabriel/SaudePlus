import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ErroHttp } from '../../../services/http.js'
import { redefinirSenha } from '../auth.api.js'
import CampoFormulario from '../components/CampoFormulario.jsx'
import CartaoAuth from '../components/CartaoAuth.jsx'
import EstadoResultado from '../components/EstadoResultado.jsx'
import { IconeAlerta, IconeCadeado } from '../components/Icones.jsx'

/**
 * Define a nova senha a partir do link recebido por e-mail.
 *
 * O token vem na query string (`/redefinir-senha?token=...`). A confirmação da
 * senha é conferida aqui: é uma proteção contra erro de digitação, não uma regra
 * de negócio, então o back-end não precisa recebê-la.
 */
export default function RedefinirSenha() {
  const [parametros] = useSearchParams()
  const token = parametros.get('token')

  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [errosDeCampo, setErrosDeCampo] = useState({})
  const [erroGeral, setErroGeral] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [concluido, setConcluido] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) {
      return
    }

    setErroGeral(null)

    const erros = {}
    if (senha.length < 8) {
      erros.senha = 'A senha deve ter pelo menos 8 caracteres.'
    }
    if (senha !== confirmacao) {
      erros.confirmacao = 'As senhas não conferem.'
    }
    setErrosDeCampo(erros)
    if (Object.keys(erros).length > 0) {
      return
    }

    setEnviando(true)

    try {
      await redefinirSenha({ token, senha })
      setConcluido(true)
    } catch (erro) {
      if (erro instanceof ErroHttp) {
        setErrosDeCampo(erro.campos)
        setErroGeral(erro.message)
      } else {
        setErroGeral('Algo deu errado por aqui. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (!token) {
    return (
      <CartaoAuth voltarPara="/login" atalho={{ texto: 'Fazer login', para: '/login' }}>
        <EstadoResultado
          tipo="erro"
          titulo="Link inválido"
          descricao="Este endereço não traz um código de redefinição. Abra o link direto do e-mail que enviamos ou peça um novo."
        >
          <Link className="sp-botao" to="/recuperar-senha">
            Pedir um novo link
          </Link>
        </EstadoResultado>
      </CartaoAuth>
    )
  }

  if (concluido) {
    return (
      <CartaoAuth>
        <EstadoResultado
          tipo="sucesso"
          titulo="Senha alterada com sucesso!"
          descricao="Sua nova senha já está valendo. Use ela para entrar na sua conta."
        >
          <Link className="sp-botao" to="/login">
            Ir para o login
          </Link>
        </EstadoResultado>
      </CartaoAuth>
    )
  }

  return (
    <CartaoAuth voltarPara="/login" atalho={{ texto: 'Fazer login', para: '/login' }}>
      <form className="sp-form" onSubmit={enviar} noValidate>
        <h1 className="sp-form__titulo">Nova senha</h1>
        <p className="sp-form__subtitulo">Escolha uma senha nova para a sua conta.</p>

        <div className="sp-form__campos">
          <CampoFormulario
            rotulo="Nova senha"
            placeholder="Nova senha"
            tipo="password"
            icone={<IconeCadeado />}
            valor={senha}
            aoAlterar={setSenha}
            autoComplete="new-password"
            maxLength={72}
            ajuda="Use pelo menos 8 caracteres."
            erro={errosDeCampo.senha}
            desabilitado={enviando}
          />

          <CampoFormulario
            rotulo="Confirmar nova senha"
            placeholder="Confirmar nova senha"
            tipo="password"
            icone={<IconeCadeado />}
            valor={confirmacao}
            aoAlterar={setConfirmacao}
            autoComplete="new-password"
            maxLength={72}
            erro={errosDeCampo.confirmacao}
            desabilitado={enviando}
          />
        </div>

        {erroGeral && (
          <p className="sp-aviso sp-aviso--erro" role="alert">
            <IconeAlerta />
            <span>{erroGeral}</span>
          </p>
        )}

        <button className="sp-botao" type="submit" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar nova senha'}
        </button>

        <p className="sp-rodape">
          O link expirou? <Link to="/recuperar-senha">Pedir um novo</Link>
        </p>
      </form>
    </CartaoAuth>
  )
}
