import MainLayout from '../../../layouts/MainLayout.jsx'
import { useAuth } from '../../auth/auth.context.js'
import { ROTULO_POR_ROLE } from '../../auth/auth.rotas.js'
import './painel.css'

/**
 * Area interna provisoria.
 *
 * Existe para que o login tenha um destino de verdade e para conferir que o
 * perfil chegou do back-end. Cada perfil ganha sua propria tela conforme as
 * funcionalidades forem implementadas.
 */
export default function Painel() {
  const { usuario, sair } = useAuth()

  return (
    <MainLayout>
      <section className="sp-painel">
        <p className="sp-painel__perfil">{ROTULO_POR_ROLE[usuario.role] ?? usuario.role}</p>
        <h1 className="sp-painel__titulo">Olá, {usuario.nomeCompleto.split(' ')[0]}!</h1>
        <p className="sp-painel__texto">
          Você entrou como <strong>{usuario.email}</strong>. Esta área ainda está em
          construção — as funcionalidades do seu perfil aparecerão aqui.
        </p>

        <button type="button" className="sp-painel__sair" onClick={sair}>
          Sair da conta
        </button>
      </section>
    </MainLayout>
  )
}
