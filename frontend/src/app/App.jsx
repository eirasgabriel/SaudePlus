<<<<<<< HEAD
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
import AgendaDoMedico from '../features/medico/telas/AgendaDoMedico.jsx'
import ConsultasDoMedico from '../features/medico/telas/ConsultasDoMedico.jsx'
import ConsultaDoMedico from '../features/medico/telas/ConsultaDoMedico.jsx'
import ExamesDoMedico from '../features/medico/telas/ExamesDoMedico.jsx'
import ExameDoMedico from '../features/medico/telas/ExameDoMedico.jsx'
import PacientesDoMedico from '../features/medico/telas/PacientesDoMedico.jsx'
import ProntuarioDoMedico from '../features/medico/telas/ProntuarioDoMedico.jsx'
import UnidadesDoMedico from '../features/medico/telas/UnidadesDoMedico.jsx'
import NotificacoesDoMedico from '../features/medico/telas/NotificacoesDoMedico.jsx'
import ContaDoMedico from '../features/medico/telas/ContaDoMedico.jsx'
import {
  PainelDoPaciente,
  ConsultasDoPaciente,
  ExamesDoPaciente,
  HistoricoDoPaciente,
  ClinicasDoPaciente,
} from '../features/paciente/pages/PacienteConectado.jsx'
import MinhasInformacoes from '../features/paciente/pages/MinhasInformacoes.jsx'
import NotificacoesDoPaciente from '../features/paciente/pages/NotificacoesDoPaciente.jsx'
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
  NotificacoesDoAdminConectado,
} from '../features/admin/pages/AdminConectado.jsx'
import ExamesDoAdmin from '../features/admin/pages/ExamesDoAdmin.jsx'
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
=======
import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PacienteDashboard from '../components/PacienteDashboard';
import ClinicasPage from '../pages/ClinicasPage';
import ConsultasPage from '../pages/ConsultasPage';
import ExamesPage from '../pages/ExamesPage';
import HistoricoPage from '../pages/HistoricoPage';
import PerfilPage from '../pages/PerfilPage';
import { mockAppointments } from '../services/dadosficticios';

/**
 * Central única de rotas do SaúdePlus.
 *
 * Como este arquivo vive em src/app/, todo import de fora da pasta sobe um nível
 * com `../`. Tudo que é da paciente fica sob /paciente, deixando a raiz livre
 * para as áreas que virão depois, como a da clínica ou a de login.
 *
 * /paciente            → Dashboard do Paciente
 * /paciente/consultas  → Minhas consultas
 * /paciente/exames     → Meus exames
 * /paciente/historico  → Meu histórico
 * /paciente/clinicas   → Clínicas
 * /paciente/perfil     → Minhas informações
 *
 * Publicando numa subpasta (https://site.com/portal/), passe
 * <BrowserRouter basename="/portal"> e ajuste o `base` no vite.config.js.
 */
export default function App() {
  // A lista mora aqui, acima das rotas: o painel e a página de consultas são
  // telas irmãs, então guardar o estado dentro de uma delas deixaria a outra sem
  // enxergar o agendamento novo. Na integração, troque o valor inicial pela API.
  const [consultas, setConsultas] = useState(mockAppointments);

  function handleAdicionarConsulta(novaConsulta) {
    // A forma funcional evita trabalhar com uma cópia velha da lista caso duas
    // confirmações aconteçam em sequência rápida.
    setConsultas((atuais) => [novaConsulta, ...atuais]);
>>>>>>> feature/dashboard-paciente
  }

  return (
    <>
      <RouteEffects />
      <Routes>
        <Route
<<<<<<< HEAD
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
          <Route path="perfil" element={<MinhasInformacoes />} />
          <Route path="notificacoes" element={<NotificacoesDoPaciente />} />
        </Route>
        <Route path="/medico" element={<RotaProtegida permitir={['MEDICO']}><Outlet /></RotaProtegida>}>
          {/* Os caminhos repetem os de features/medico/rotas.js. */}
          <Route index element={<PainelMedicoConectado />} />
          <Route path="agenda" element={<AgendaDoMedico />} />
          <Route path="consultas" element={<ConsultasDoMedico />} />
          <Route path="consultas/:consultaId" element={<ConsultaDoMedico />} />
          <Route path="exames" element={<ExamesDoMedico />} />
          <Route path="exames/:exameId" element={<ExameDoMedico />} />
          <Route path="pacientes" element={<PacientesDoMedico />} />
          <Route path="pacientes/:pacienteId" element={<ProntuarioDoMedico />} />
          <Route path="busca" element={<PacientesDoMedico titulo="Busca" />} />
          <Route path="unidade" element={<UnidadesDoMedico />} />
          <Route path="notificacoes" element={<NotificacoesDoMedico />} />
          <Route path="conta" element={<ContaDoMedico />} />
        </Route>
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
          <Route path="exames" element={<ExamesDoAdmin />} />
          <Route path="notificacoes" element={<NotificacoesDoAdminConectado />} />
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
=======
          path="/paciente"
          element={
            <PacienteDashboard consultas={consultas} onConfirmar={handleAdicionarConsulta} />
          }
        />
        <Route path="/paciente/consultas" element={<ConsultasPage consultas={consultas} />} />
        <Route path="/paciente/exames" element={<ExamesPage />} />
        <Route path="/paciente/historico" element={<HistoricoPage />} />
        <Route path="/paciente/clinicas" element={<ClinicasPage />} />
        <Route path="/paciente/perfil" element={<PerfilPage />} />

        {/* Cobre a raiz e qualquer endereço desconhecido */}
        <Route path="*" element={<Navigate to="/paciente" replace />} />
      </Routes>
    </BrowserRouter>
  );
>>>>>>> feature/dashboard-paciente
}
