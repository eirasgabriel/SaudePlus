import { Navigate, Route, Routes } from 'react-router-dom'
import RotaProtegida from '../components/RotaProtegida.jsx'
import SomenteVisitante from '../components/SomenteVisitante.jsx'
import Cadastro from '../features/auth/pages/Cadastro.jsx'
import Login from '../features/auth/pages/Login.jsx'
import RecuperarSenha from '../features/auth/pages/RecuperarSenha.jsx'
import RedefinirSenha from '../features/auth/pages/RedefinirSenha.jsx'
import Painel from '../features/painel/pages/Painel.jsx'

/**
 * Rotas da aplicacao.
 *
 * /login e /cadastro sao publicas. As areas por perfil exigem autenticacao; a
 * checagem definitiva e feita pelo back-end a cada requisicao.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <SomenteVisitante>
            <Login />
          </SomenteVisitante>
        }
      />
      <Route
        path="/cadastro"
        element={
          <SomenteVisitante>
            <Cadastro />
          </SomenteVisitante>
        }
      />

      <Route
        path="/recuperar-senha"
        element={
          <SomenteVisitante>
            <RecuperarSenha />
          </SomenteVisitante>
        }
      />
      {/*
        O link do e-mail traz o token na query string: /redefinir-senha?token=...
        Fica fora do SomenteVisitante de propósito: quem clica no link com uma
        sessão aberta precisa conseguir trocar a senha, não ser mandado ao painel.
      */}
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />

      <Route
        path="/paciente"
        element={
          <RotaProtegida permitir={['PACIENTE']}>
            <Painel />
          </RotaProtegida>
        }
      />
      <Route
        path="/medico"
        element={
          <RotaProtegida permitir={['MEDICO']}>
            <Painel />
          </RotaProtegida>
        }
      />
      <Route
        path="/admin"
        element={
          <RotaProtegida permitir={['ADMIN']}>
            <Painel />
          </RotaProtegida>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
