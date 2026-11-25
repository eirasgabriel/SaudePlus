import { useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from '../components/Footer/Footer.jsx'
import ChatFlutuante from '../components/ChatFlutuante/ChatFlutuante.jsx'
import { useIdentidadeDoSite } from '../services/identidadeDoSite.js'

/* Na Ajuda o chat abre pelo cartão "Chat online" do Fale conosco: lá o botão
   flutuante seria repetido. */
const SEM_BOTAO_DE_CHAT = ['/ajuda']

export default function MainLayout({ children }) {
  const location = useLocation()
  // Nome, contatos e cores de Configurações > Geral, só no site público.
  useIdentidadeDoSite()
  return (
    <ChatFlutuante mostrarBotao={!SEM_BOTAO_DE_CHAT.includes(location.pathname)}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header key={location.key} />
      <main id="conteudo" tabIndex={-1}>{children}</main>
      <Footer tom="azul" />
    </ChatFlutuante>
  )
}
