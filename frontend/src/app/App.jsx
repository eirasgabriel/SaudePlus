import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PacienteDashboard from '../components/PacienteDashboard';
import ConsultasPage from '../pages/ConsultasPage';
import ExamesPage from '../pages/ExamesPage';
import HistoricoPage from '../pages/HistoricoPage';
import ClinicasPage from '../pages/ClinicasPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PacienteDashboard />} />
        <Route path="/consultas" element={<ConsultasPage />} />
        <Route path="/exames" element={<ExamesPage />} />
        <Route path="/historico" element={<HistoricoPage />} />
        <Route path="/clinicas" element={<ClinicasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}