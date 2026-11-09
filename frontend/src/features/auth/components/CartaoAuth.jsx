import { Link } from 'react-router-dom'
import Logo from '../../../components/Logo/Logo.jsx'
import IlustracaoAuth from './IlustracaoAuth.jsx'
import { IconeChevronEsquerda } from './Icones.jsx'
import './auth.css'

/**
 * Moldura compartilhada das telas de autenticação.
 *
 * Duas colunas: à esquerda a casca azul com ondas, a marca e a ilustração;
 * à direita o formulário, numa coluna estreita que encolhe com a altura da
 * janela para caber sem rolagem. No celular a casca vira uma faixa curta no
 * topo.
 *
 * @param {object} props
 * @param {string} [props.voltarPara]  destino da seta de voltar; sem ela a seta não aparece
 * @param {boolean} [props.largo]  coluna mais larga, para formulários com campos lado a lado
 */
export default function CartaoAuth({ voltarPara, largo = false, children }) {
  return (
    <div className={largo ? 'sp-auth sp-auth--ilustrada sp-auth--largo' : 'sp-auth sp-auth--ilustrada'}>
      <aside className="sp-auth__casca">
        <svg
          className="sp-auth__ondas"
          viewBox="0 0 600 900"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 230C120 300 260 250 380 150S560 20 600 0V0H0Z" fill="rgba(255,255,255,0.05)" />
          <path d="M0 250C140 310 280 240 400 130S560 10 610 -10" stroke="rgba(120,200,255,0.55)" strokeWidth="2" fill="none" />
          <path d="M0 900V760C160 690 320 720 460 640S600 560 600 560V900Z" fill="rgba(255,255,255,0.05)" />
          <path d="M-10 770C160 700 320 730 460 650S600 570 620 560" stroke="rgba(120,200,255,0.35)" strokeWidth="2" fill="none" />
        </svg>

        <Logo tone="light" tagline={false} />

        <IlustracaoAuth className="sp-auth__ilustracao" />
      </aside>

      <div className="sp-auth__painel">
        <header className="sp-auth__topo">
          {voltarPara && (
            <Link to={voltarPara} className="sp-auth__voltar" aria-label="Voltar">
              <IconeChevronEsquerda />
            </Link>
          )}

        </header>

        <main className="sp-auth__conteudo">
          <div className="sp-auth__miolo">{children}</div>
        </main>
      </div>
    </div>
  )
}
