import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ErroHttp } from '../../../services/http.js'
import { solicitarRecuperacaoDeSenha } from '../auth.api.js'
import CampoFormulario from '../components/CampoFormulario.jsx'
import CartaoAuth from '../components/CartaoAuth.jsx'
import EstadoResultado from '../components/EstadoResultado.jsx'
import { IconeAlerta, IconeEnvelope } from '../components/Icones.jsx'

/**
 * Pedido de recuperação de senha.
 *
 * A confirmação é a mesma exista ou não a conta — de propósito. Responder
 * "e-mail não encontrado" transformaria a tela num consultor de quais e-mails
 * estão cadastrados na plataforma.
 */
export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [errosDeCampo, setErrosDeCampo] = useState({})
  const [erroGeral, setErroGeral] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) {
      return
    }

    setErroGeral(null)
    setErrosDeCampo({})
    setEnviando(true)

    try {
      await solicitarRecuperacaoDeSenha({ email })
      setEnviado(true)
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

  if (enviado) {
    return (
      <CartaoAuth voltarPara="/login" atalho={{ texto: 'Fazer login', para: '/login' }}>
        <EstadoResultado
          tipo="info"
          titulo="Verifique seu e-mail"
          descricao={
            <>
              Se existir uma conta com <strong>{email}</strong>, enviamos um link para criar
              uma nova senha. O link vale por 30 minutos e só pode ser usado uma vez.
            </>
          }
        >
          <Link className="sp-botao" to="/login">
            Voltar para o login
          </Link>

          <p className="sp-rodape">
            Não chegou?{' '}
            <button
              type="button"
              className="sp-link-inline"
              onClick={() => setEnviado(false)}
            >
              Tentar outro e-mail
            </button>
          </p>
        </EstadoResultado>
      </CartaoAuth>
    )
  }

  return (
    <CartaoAuth voltarPara="/login" atalho={{ texto: 'Fazer login', para: '/login' }}>
      <form className="sp-form" onSubmit={enviar} noValidate>
        <h1 className="sp-form__titulo">Recuperar senha</h1>
        <p className="sp-form__subtitulo">
          Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
        </p>

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
        </div>

        {erroGeral && (
          <p className="sp-aviso sp-aviso--erro" role="alert">
            <IconeAlerta />
            <span>{erroGeral}</span>
          </p>
        )}

        <button className="sp-botao" type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>

        <p className="sp-rodape">
          Lembrou a senha? <Link to="/login">Fazer login</Link>
        </p>
      </form>
    </CartaoAuth>
  )
}
