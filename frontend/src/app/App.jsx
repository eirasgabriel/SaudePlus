import { useRef, useState } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import AvailabilityNotice from '../components/AvailabilityNotice/AvailabilityNotice.jsx'
import Button from '../components/Button/Button.jsx'
import RotaProtegida from '../components/RotaProtegida.jsx'
import SomenteVisitante from '../components/SomenteVisitante.jsx'
import Home from '../features/home/pages/Home.jsx'
import Especialidades from '../features/profissionais/pages/Especialidades.jsx'
import Buscar from '../features/profissionais/pages/Buscar.jsx'
import ComoFunciona from '../features/institucional/pages/ComoFunciona.jsx'
import SobreNos from '../features/institucional/pages/SobreNos.jsx'
import Ajuda from '../features/ajuda/pages/Ajuda.jsx'
import Cadastro from '../features/auth/pages/Cadastro.jsx'
import Login from '../features/auth/pages/Login.jsx'
import RecuperarSenha from '../features/auth/pages/RecuperarSenha.jsx'
import RedefinirSenha from '../features/auth/pages/RedefinirSenha.jsx'
import PainelMedicoConectado from '../features/medico/pages/PainelMedicoConectado.jsx'
import PacienteDashboard from '../components/PacienteDashboard.jsx'
import ConsultasPage from '../pages/ConsultasPage.jsx'
import ExamesPage from '../pages/ExamesPage.jsx'
import HistoricoPage from '../pages/HistoricoPage.jsx'
import ClinicasPage from '../pages/ClinicasPage.jsx'
import '../styles/area-paciente.css'
import AdminLayout from '../layouts/AdminLayout.jsx'
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx'
import AdminUsuariosPage from '../pages/AdminUsuariosPage.jsx'
import AdminClinicasPage from '../pages/AdminClinicasPage.jsx'
import AdminAgendamentosPage from '../pages/AdminAgendamentosPage.jsx'
import AdminRelatoriosPage from '../pages/AdminRelatoriosPage.jsx'
import AdminFinanceiroPage from '../pages/AdminFinanceiroPage.jsx'
import AdminConfiguracoesPage from '../pages/AdminConfiguracoesPage.jsx'
import AdminSuportePage from '../pages/AdminSuportePage.jsx'
import RouteEffects from './RouteEffects.jsx'
import styles from './App.module.css'

/**
 * Rotas da aplicação.
 *
 * - Site institucional (homepage): dentro do MainLayout, com cabeçalho público.
 * - Autenticação: telas de página inteira, só para visitantes.
 * - Áreas por perfil: exigem login. A checagem definitiva é do back-end.
 */
export default function App() {
  const location = useLocation()
  const noticeRef = useRef(null)
  const [notice, setNotice] = useState({ title: '', query: '' })

  function showUnavailable(title, query = '') {
    setNotice({ title, query })
    noticeRef.current.showModal()
  }

  return (
    <>
      <RouteEffects />
      <Routes>
        <Route
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/especialidades" element={<Especialidades />} />
          <Route path="/buscar" element={<Buscar key={location.search} onUnavailable={showUnavailable} />} />
          <Route path="/como-funciona" element={<ComoFunciona onUnavailable={showUnavailable} />} />
          <Route path="/sobre-nos" element={<SobreNos onUnavailable={showUnavailable} />} />
          <Route path="/ajuda" element={<Ajuda onUnavailable={showUnavailable} />} />
          <Route
            path="*"
            element={
              <section className={styles.notFound}>
                <h1>Página não encontrada</h1>
                <p>O endereço pode ter mudado. Continue pela página inicial.</p>
                <Button to="/">Voltar ao início</Button>
              </section>
            }
          />
        </Route>

        <Route path="/login" element={<SomenteVisitante><Login /></SomenteVisitante>} />
        <Route path="/cadastro" element={<SomenteVisitante><Cadastro /></SomenteVisitante>} />
        <Route path="/recuperar-senha" element={<SomenteVisitante><RecuperarSenha /></SomenteVisitante>} />
        {/* Fora do SomenteVisitante de propósito: o link do e-mail precisa funcionar com sessão aberta. */}
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        <Route
          path="/paciente"
          element={
            <RotaProtegida permitir={['PACIENTE']}>
              <div className="area-paciente">
                <Outlet />
              </div>
            </RotaProtegida>
          }
        >
          <Route index element={<PacienteDashboard />} />
          <Route path="consultas" element={<ConsultasPage />} />
          <Route path="exames" element={<ExamesPage />} />
          <Route path="historico" element={<HistoricoPage />} />
          <Route path="clinicas" element={<ClinicasPage />} />
        </Route>
        <Route path="/medico" element={<RotaProtegida permitir={['MEDICO']}><PainelMedicoConectado /></RotaProtegida>} />
        <Route
          path="/admin"
          element={
            <RotaProtegida permitir={['ADMIN']}>
              <AdminLayout />
            </RotaProtegida>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
          <Route path="clinicas" element={<AdminClinicasPage />} />
          <Route path="agendamentos" element={<AdminAgendamentosPage />} />
          <Route path="relatorios" element={<AdminRelatoriosPage />} />
          <Route path="financeiro" element={<AdminFinanceiroPage />} />
          {/* As abas ficam na query string: /admin/configuracoes?aba=seguranca */}
          <Route path="configuracoes" element={<AdminConfiguracoesPage />} />
          <Route path="suporte" element={<AdminSuportePage />} />
        </Route>
      </Routes>
      <AvailabilityNotice ref={noticeRef} {...notice} />
    </>
  )
}
