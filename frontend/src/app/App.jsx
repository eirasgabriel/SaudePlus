import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUsuariosPage from '../pages/AdminUsuariosPage';
import AdminClinicasPage from '../pages/AdminClinicasPage';
import AdminAgendamentosPage from '../pages/AdminAgendamentosPage';
import AdminRelatoriosPage from '../pages/AdminRelatoriosPage';
import AdminFinanceiroPage from '../pages/AdminFinanceiroPage';
import AdminConfiguracoesPage from '../pages/AdminConfiguracoesPage';
import AdminSuportePage from '../pages/AdminSuportePage';

/**
 * Rotas da área administrativa.
 *
 * As rotas do paciente vivem na branch `feature/dashboard-paciente` e serão
 * somadas aqui quando as duas forem integradas: o paciente fica em `/` e o
 * admin permanece em `/admin`, sem colisão de endereços.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A raiz abre a área administrativa */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route path="/admin" element={<AdminLayout />}>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
