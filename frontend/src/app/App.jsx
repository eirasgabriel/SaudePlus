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
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
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
}
