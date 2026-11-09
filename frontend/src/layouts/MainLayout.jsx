import { useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from '../components/Footer/Footer.jsx'

export default function MainLayout({ children }) {
  const location = useLocation()
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header key={location.key} />
      <main id="conteudo" tabIndex={-1}>{children}</main>
      <Footer tom="azul" />
    </>
  )
}
