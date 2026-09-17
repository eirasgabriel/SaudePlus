import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Sua saúde em primeiro lugar',
  '/especialidades': 'Especialidades',
  '/buscar': 'Buscar profissionais',
  '/como-funciona': 'Como funciona',
  '/sobre-nos': 'Sobre nós',
  '/ajuda': 'Ajuda',
}

export default function RouteEffects() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    document.title = `SaúdePlus — ${titles[pathname] ?? 'Página não encontrada'}`
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('conteudo')?.focus({ preventScroll: true })
    }
  }, [pathname, search, hash])
  return null
}
