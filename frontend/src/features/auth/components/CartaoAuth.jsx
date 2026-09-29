import { Link } from 'react-router-dom'
import wordmark from '../../../assets/images/wordmark.svg'
import { IconeChevronEsquerda } from './Icones.jsx'
import './auth.css'

/**
 * Moldura compartilhada das telas de autenticação.
 *
 * Ocupa a página inteira: barra no topo atravessando toda a largura e o conteúdo
 * numa coluna centralizada, vertical e horizontalmente.
 *
 * @param {object} props
 * @param {string} [props.voltarPara]  destino da seta de voltar; sem ela a seta não aparece
 * @param {{texto: string, para: string}} [props.atalho]  link do canto superior direito
 */
export default function CartaoAuth({ voltarPara, atalho, children }) {
  return (
    <div className="sp-auth">
      <header className="sp-auth__topo">
        {voltarPara ? (
          <Link to={voltarPara} className="sp-auth__voltar" aria-label="Voltar">
            <IconeChevronEsquerda />
          </Link>
        ) : (
          <span />
        )}

        {atalho ? (
          <Link to={atalho.para} className="sp-auth__atalho">
            {atalho.texto}
          </Link>
        ) : (
          <span />
        )}
      </header>

      <main className="sp-auth__conteudo">
        <div className="sp-auth__miolo">
          <img className="sp-auth__logo" src={wordmark} alt="SaúdePlus" />

          <p className="sp-auth__slogan">
            A sua Saúde, sempre andando
            <br />
            junto com você!
          </p>

          {children}
        </div>
      </main>
    </div>
  )
}
