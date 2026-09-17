import { useLocation } from 'react-router-dom'
import Header from './Header.jsx'

export default function MainLayout({ children, onUnavailable }) {
  const location = useLocation()
  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header key={location.key} onUnavailable={onUnavailable} />
      <main id="conteudo" tabIndex={-1}>{children}</main>
    </>
  )
}
