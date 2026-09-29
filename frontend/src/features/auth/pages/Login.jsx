import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErroHttp } from '../../../services/http.js'
import { useAuth } from '../auth.context.js'
import { rotaInicialDe } from '../auth.rotas.js'
import CampoFormulario from '../components/CampoFormulario.jsx'
import CartaoAuth from '../components/CartaoAuth.jsx'
import { IconeAlerta, IconeCadeado, IconeEnvelope } from '../components/Icones.jsx'

/**
 * Tela de login, usada pelos tres perfis.
 *
 * Paciente, medico e admin entram por aqui; o que muda e o destino apos o
 * sucesso, definido pelo perfil que o back-end devolve.
 */
export default function Login() {
  const navegar = useNavigate()
  const { entrar } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [errosDeCampo, setErrosDeCampo] = useState({})
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) {
      return
    }

    setAviso(null)
    setErrosDeCampo({})
    setEnviando(true)

    try {
      const usuario = await entrar({ email, senha, lembrar })
      navegar(rotaInicialDe(usuario), { replace: true })
    } catch (erro) {
      if (erro instanceof ErroHttp) {
        setErrosDeCampo(erro.campos)
        setAviso({ tipo: 'erro', texto: erro.message })
      } else {
        setAviso({ tipo: 'erro', texto: 'Algo deu errado por aqui. Tente novamente.' })
      }
      setEnviando(false)
    }
  }

  function avisarEmBreve(recurso) {
    setErrosDeCampo({})
    setAviso({
      tipo: 'info',
      texto: `${recurso} ainda não está disponível. Por enquanto, entre com e-mail e senha.`,
    })
  }

  return (
    <CartaoAuth voltarPara="/" atalho={{ texto: 'Criar conta', para: '/cadastro' }}>
      <form className="sp-form" onSubmit={enviar} noValidate>
        <h1 className="sp-form__titulo">Login</h1>
        <p className="sp-form__subtitulo">Acesse sua conta para continuar</p>

        <div className="sp-form__campos">
          <CampoFormulario
            rotulo="E-mail"
            placeholder="E-mail"
            tipo="email"
            icone={<IconeEnvelope />}
            valor={email}
            aoAlterar={setEmail}
            autoComplete="email"
            inputMode="email"
            maxLength={180}
            erro={errosDeCampo.email}
            desabilitado={enviando}
          />

          <CampoFormulario
            rotulo="Senha"
            placeholder="Senha"
            tipo="password"
            icone={<IconeCadeado />}
            valor={senha}
            aoAlterar={setSenha}
            autoComplete="current-password"
            maxLength={72}
            erro={errosDeCampo.senha}
            desabilitado={enviando}
          />
        </div>

        <div className="sp-form__opcoes">
          <label className="sp-checkbox">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(evento) => setLembrar(evento.target.checked)}
              disabled={enviando}
            />
            Lembrar de mim
          </label>

          <Link className="sp-link-discreto" to="/recuperar-senha">
            Esqueceu sua senha?
          </Link>
        </div>

        {aviso && (
          <p className={`sp-aviso sp-aviso--${aviso.tipo}`} role="alert">
            <IconeAlerta />
            <span>{aviso.texto}</span>
          </p>
        )}

        <button className="sp-botao" type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="sp-separador">ou</div>

        {/*
          Login social ainda nao implementado no back-end. Os botoes ficam aqui
          para manter o layout aprovado. Ao ligar o OAuth, use os arquivos
          oficiais de marca do Google (Sign in with Google branding guidelines)
          e da Apple (Human Interface Guidelines) no lugar do texto puro:
          usar o logotipo oficial e exigido por ambas as empresas.
        */}
        <div className="sp-social">
          <button
            type="button"
            className="sp-botao sp-botao--secundario"
            onClick={() => avisarEmBreve('O login com Google')}
          >
            Continuar com Google
          </button>

          <button
            type="button"
            className="sp-botao sp-botao--secundario"
            onClick={() => avisarEmBreve('O login com Apple')}
          >
            Continuar com Apple
          </button>
        </div>

        <p className="sp-rodape">
          Ainda não tem uma conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </CartaoAuth>
  )
}
