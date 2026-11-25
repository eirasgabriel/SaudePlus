import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { nomeDoSistema } from '../services/identidadeDoSite.js'

const titles = {
  '/clinica': 'Minha unidade clínica',
  '/clinica/medicos': 'Médicos da unidade',
  '/clinica/conta': 'Conta da clínica',
  '/clinica/notificacoes': 'Notificações da clínica',
  '/admin/conta': 'Minha conta',
  '/paciente': 'Meu painel',
  '/paciente/consultas': 'Minhas consultas',
  '/paciente/exames': 'Meus exames',
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
    document.title = `${nomeDoSistema()} — ${title}`
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView()
    else {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('conteudo')?.focus({ preventScroll: true })
    }
  }, [pathname, search, hash])
  return null
}
