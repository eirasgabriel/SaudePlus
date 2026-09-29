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
import PerfilProfissional from '../features/profissionais/pages/PerfilProfissional.jsx'
import ComoFunciona from '../features/institucional/pages/ComoFunciona.jsx'
import SobreNos from '../features/institucional/pages/SobreNos.jsx'
import Ajuda from '../features/ajuda/pages/Ajuda.jsx'
import Cadastro from '../features/auth/pages/Cadastro.jsx'
import Login from '../features/auth/pages/Login.jsx'
import RecuperarSenha from '../features/auth/pages/RecuperarSenha.jsx'
import RedefinirSenha from '../features/auth/pages/RedefinirSenha.jsx'
import PainelMedicoConectado from '../features/medico/pages/PainelMedicoConectado.jsx'
import {
  PainelDoPaciente,
  ConsultasDoPaciente,
  ExamesDoPaciente,
  HistoricoDoPaciente,
  ClinicasDoPaciente,
} from '../features/paciente/pages/PacienteConectado.jsx'
import '../styles/area-paciente.css'
import {
  LayoutDoAdmin,
  DashboardDoAdmin,
  UsuariosDoAdmin,
  ClinicasDoAdmin,
  AgendamentosDoAdmin,
  ConfiguracoesDoAdmin,
  FinanceiroDoAdmin,
  RelatoriosDoAdmin,
} from '../features/admin/pages/AdminConectado.jsx'
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
          <Route path="/profissionais/:id" element={<PerfilProfissional key={location.pathname} />} />
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
          <Route index element={<PainelDoPaciente />} />
          <Route path="consultas" element={<ConsultasDoPaciente />} />
          <Route path="exames" element={<ExamesDoPaciente />} />
          <Route path="historico" element={<HistoricoDoPaciente />} />
          <Route path="clinicas" element={<ClinicasDoPaciente />} />
        </Route>
        <Route path="/medico" element={<RotaProtegida permitir={['MEDICO']}><PainelMedicoConectado /></RotaProtegida>} />
        <Route
          path="/admin"
          element={
            // A equipe entra também; o servidor e o menu limitam aos módulos liberados.
            <RotaProtegida permitir={['ADMIN', 'GESTOR', 'ENFERMEIRO', 'RECEPCIONISTA', 'AGENTE']}>
              <LayoutDoAdmin />
            </RotaProtegida>
          }
        >
          <Route index element={<DashboardDoAdmin />} />
          <Route path="usuarios" element={<UsuariosDoAdmin />} />
          <Route path="clinicas" element={<ClinicasDoAdmin />} />
          <Route path="agendamentos" element={<AgendamentosDoAdmin />} />
          <Route path="relatorios" element={<RelatoriosDoAdmin />} />
          <Route path="financeiro" element={<FinanceiroDoAdmin />} />
          {/* As abas ficam na query string: /admin/configuracoes?aba=seguranca */}
          <Route path="configuracoes" element={<ConfiguracoesDoAdmin />} />
          <Route path="suporte" element={<AdminSuportePage />} />
        </Route>
      </Routes>
      <AvailabilityNotice ref={noticeRef} {...notice} />
    </>
  )
}
