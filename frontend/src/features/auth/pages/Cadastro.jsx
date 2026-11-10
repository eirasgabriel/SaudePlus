import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErroHttp } from '../../../services/http.js'
import { useAuth } from '../auth.context.js'
import { rotaInicialDe } from '../auth.rotas.js'
import CampoFormulario from '../components/CampoFormulario.jsx'
import CartaoAuth from '../components/CartaoAuth.jsx'
import EstadoResultado from '../components/EstadoResultado.jsx'
import MedidorSenha from '../components/MedidorSenha.jsx'
import {
  IconeAlerta,
  IconeCadeado,
  IconeCoracao,
  IconeEnvelope,
  IconePessoa,
  IconeTelefone,
} from '../components/Icones.jsx'

/**
 * Tela de cadastro. Cria exclusivamente contas de paciente.
 *
 * Não existe seletor de perfil: quem define o perfil é o back-end, que sempre
 * grava PACIENTE nesta rota. Médico e admin recebem a conta pela administração.
 */
export default function Cadastro() {
  const navegar = useNavigate()
  const { registrar, aplicarSessao } = useAuth()

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [errosDeCampo, setErrosDeCampo] = useState({})
  const [aviso, setAviso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // Resposta da API depois do cadastro. Enquanto estiver preenchida, a tela
  // mostra a confirmação no lugar do formulário.
  const [contaCriada, setContaCriada] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) {
      return
    }

    setAviso(null)
    setErrosDeCampo({})

    // Checagens locais: confirmação da senha e aceite. Evitam uma ida ao
    // servidor por um erro de digitação ou um clique esquecido. A confirmação
    // nunca é enviada; o back-end só recebe a senha.
    const errosLocais = {}
    if (senha !== confirmarSenha) {
      errosLocais.confirmarSenha = 'As senhas não conferem.'
    }
    if (!aceiteTermos) {
      errosLocais.aceiteTermos = 'É preciso aceitar os Termos de Uso e a Política de Privacidade.'
    }
    if (Object.keys(errosLocais).length > 0) {
      setErrosDeCampo(errosLocais)
      return
    }

    setEnviando(true)

    try {
      const resposta = await registrar({ nomeCompleto, email, senha, telefone, aceiteTermos })
      setContaCriada(resposta)
    } catch (erro) {
      if (erro instanceof ErroHttp) {
        setErrosDeCampo(erro.campos)
        setAviso({ tipo: 'erro', texto: erro.message })
      } else {
        setAviso({ tipo: 'erro', texto: 'Algo deu errado por aqui. Tente novamente.' })
      }
    } finally {
      setEnviando(false)
    }
  }

  function entrarNaConta() {
    const usuario = aplicarSessao(contaCriada)
    navegar(rotaInicialDe(usuario), { replace: true })
  }

  function abrirDocumento(evento, documento) {
    // O botão vive dentro do <label>: sem isto o clique também marcaria o checkbox.
    evento.preventDefault()
    evento.stopPropagation()
    setAviso({ tipo: 'info', texto: `${documento} será publicado antes do lançamento.` })
  }

  if (contaCriada) {
    const primeiroNome = contaCriada.usuario.nomeCompleto.split(' ')[0]

    return (
      <CartaoAuth>
        <EstadoResultado
          tipo="sucesso"
          titulo="Conta criada com sucesso!"
          descricao={
            <>
              Boas-vindas, <strong>{primeiroNome}</strong>! Sua conta de paciente já está
              pronta e o e-mail <strong>{contaCriada.usuario.email}</strong> é o seu acesso.
            </>
          }
        >
          <button type="button" className="sp-botao" onClick={entrarNaConta}>
            Continuar
          </button>
        </EstadoResultado>
      </CartaoAuth>
    )
  }

  return (
    <CartaoAuth largo voltarPara="/login">
      <form className="sp-form" onSubmit={enviar} noValidate>
        <h1 className="sp-form__titulo">Criar conta</h1>
        <p className="sp-form__subtitulo">Preencha seus dados para começar</p>

        <div className="sp-form__campos">
          <CampoFormulario
            rotulo="Nome completo"
            placeholder="Nome completo"
            icone={<IconePessoa />}
            valor={nomeCompleto}
            aoAlterar={setNomeCompleto}
            autoComplete="name"
            maxLength={120}
            erro={errosDeCampo.nomeCompleto}
            desabilitado={enviando}
          />

          <div className="sp-form__linha">
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
              rotulo="Telefone (opcional)"
              placeholder="Telefone (opcional)"
              tipo="tel"
              icone={<IconeTelefone />}
              valor={telefone}
              aoAlterar={setTelefone}
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              erro={errosDeCampo.telefone}
              desabilitado={enviando}
            />
          </div>

          <div className="sp-form__linha">
            <div>
              <CampoFormulario
                rotulo="Senha"
                placeholder="Senha"
                tipo="password"
                icone={<IconeCadeado />}
                valor={senha}
                aoAlterar={setSenha}
                autoComplete="new-password"
                maxLength={72}
                erro={errosDeCampo.senha}
                desabilitado={enviando}
              />

              <MedidorSenha senha={senha} />
            </div>

            <CampoFormulario
              rotulo="Confirmar senha"
              placeholder="Confirmar senha"
              tipo="password"
              icone={<IconeCadeado />}
              valor={confirmarSenha}
              aoAlterar={setConfirmarSenha}
              autoComplete="new-password"
              maxLength={72}
              erro={errosDeCampo.confirmarSenha}
              desabilitado={enviando}
            />
          </div>
        </div>

        <div className="sp-checkbox sp-checkbox--termos">
          <input
            id="sp-aceite-termos"
            type="checkbox"
            checked={aceiteTermos}
            onChange={(evento) => setAceiteTermos(evento.target.checked)}
            disabled={enviando}
            aria-invalid={errosDeCampo.aceiteTermos ? true : undefined}
          />
          <label htmlFor="sp-aceite-termos">
            Aceito os{' '}
            <button
              type="button"
              className="sp-link-inline"
              onClick={(evento) => abrirDocumento(evento, 'O Termo de Uso')}
            >
              Termos de Uso
            </button>{' '}
            e a{' '}
            <button
              type="button"
              className="sp-link-inline"
              onClick={(evento) => abrirDocumento(evento, 'A Política de Privacidade')}
            >
              Política de Privacidade
            </button>
          </label>
        </div>

        {errosDeCampo.aceiteTermos && (
          <p className="sp-campo__erro" role="alert">
            {errosDeCampo.aceiteTermos}
          </p>
        )}

        {aviso && (
          <p className={`sp-aviso sp-aviso--${aviso.tipo}`} role="alert">
            <IconeAlerta />
            <span>{aviso.texto}</span>
          </p>
        )}

        <button className="sp-botao" type="submit" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>

        <div className="sp-destaque">
          <span className="sp-destaque__icone">
            <IconeCoracao />
          </span>
          <p>Mais saúde, mais momentos para o que realmente importa!</p>
        </div>

        <p className="sp-rodape">
          Já tem uma conta? <Link to="/login">Fazer login</Link>
        </p>
      </form>
    </CartaoAuth>
  )
}
