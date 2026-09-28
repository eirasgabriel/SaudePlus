import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../pages/LoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminUsuariosPage from '../pages/AdminUsuariosPage';
import AdminClinicasPage from '../pages/AdminClinicasPage';
import AdminAgendamentosPage from '../pages/AdminAgendamentosPage';
import AdminRelatoriosPage from '../pages/AdminRelatoriosPage';
import AdminFinanceiroPage from '../pages/AdminFinanceiroPage';
import AdminConfiguracoesPage from '../pages/AdminConfiguracoesPage';
import AdminSuportePage from '../pages/AdminSuportePage';
import { login } from '../features/auth/auth.api';

/**
 * Credenciais usadas para entrar automaticamente, sem passar pela tela de
 * login. Pensado para ambiente de desenvolvimento/demonstração: se a API
 * estiver fora do ar, cai de volta para a tela de login normal.
 */
const CREDENCIAIS_AUTOMATICAS = { email: 'admin@saudeplus.com', senha: 'admin123' };

/**
 * Guarda de rota da área administrativa.
 *
 * Se já existe um token salvo, entra direto. Se não existe, faz login
 * automático em segundo plano (sem mostrar o formulário) e só cai para
 * `/login` se esse login automático falhar (ex.: back-end fora do ar).
 */
function ProtectedAdminRoute() {
  const [status, definirStatus] = useState(
    localStorage.getItem('saudeplus-token') ? 'pronto' : 'entrando'
  );

  useEffect(() => {
    if (status !== 'entrando') return;

    let ativo = true;
    login(CREDENCIAIS_AUTOMATICAS)
      .then((dados) => {
        if (!ativo) return;
        const usuario = {
          nome: dados.nome ?? 'Admin Master',
          email: dados.email ?? CREDENCIAIS_AUTOMATICAS.email,
          cargo: dados.cargo ?? 'Administrador',
          perfil: dados.perfil ?? 'administrador',
        };
        localStorage.setItem('saudeplus-token', dados.token ?? 'demo-token-saudeplus');
        localStorage.setItem('saudeplus-user', JSON.stringify(usuario));
        definirStatus('pronto');
      })
      .catch(() => {
        if (ativo) definirStatus('falhou');
      });

    return () => {
      ativo = false;
    };
  }, [status]);

  if (status === 'entrando') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: '#5d7286',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Entrando...
      </div>
    );
  }

  if (status === 'falhou') {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

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
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
          <Route path="clinicas" element={<AdminClinicasPage />} />
          <Route path="agendamentos" element={<AdminAgendamentosPage />} />
          <Route path="relatorios" element={<AdminRelatoriosPage />} />
          <Route path="financeiro" element={<AdminFinanceiroPage />} />
          <Route path="configuracoes" element={<AdminConfiguracoesPage />} />
          <Route path="suporte" element={<AdminSuportePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
