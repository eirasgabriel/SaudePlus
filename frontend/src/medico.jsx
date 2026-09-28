/* Ponto de entrada do painel do médico.
   Arquivo novo e independente: não altera `src/main.jsx` nem o roteamento
   institucional. Quando a área logada entrar no React Router, este arquivo
   é descartado e o painel vira uma rota. */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/tokens.css";
import "./styles/global.css";
import PainelMedicoConectado from "./features/medico/pages/PainelMedicoConectado.jsx";

/* A versão conectada busca os dados da API e cai nos mocks quando o
   back-end não está no ar, para o painel continuar utilizável sozinho.
   Para ver a tela apenas com mocks, troque por `DashboardMedico`. */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PainelMedicoConectado />
  </StrictMode>,
);
