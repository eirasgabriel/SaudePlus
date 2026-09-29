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
    // O perfil troca pelo nome do profissional quando os dados chegam.
    const title = titles[pathname] ?? (pathname.startsWith('/profissionais/') ? 'Perfil do profissional' : 'Página não encontrada')
    document.title = `SaúdePlus — ${title}`
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('conteudo')?.focus({ preventScroll: true })
    }
  }, [pathname, search, hash])
  return null
}
