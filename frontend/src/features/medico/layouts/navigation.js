/* Navegação do painel do médico.
   Os itens não carregam URL: carregam o nome do destino, resolvido por
   `../rotas.js`. Assim um endereço muda num lugar só.

   ATIVAR ROTAS (passo 4): com o React Router no ar, o campo `destino` vira o
   `to` do <NavLink> — veja o comentário em DashboardHeader.jsx e em
   DashboardSidebar.jsx, que marcam a linha exata a trocar. */

import {
  CalendarIcon,
  StethoscopeIcon,
  UsersIcon,
  BuildingIcon,
  UserIcon,
} from "../../../components/icons/Icons.jsx";
import { HomeIcon, FlaskIcon, HelpIcon, LogoutIcon } from "../components/icons/MedicoIcons.jsx";

/* O item da página atual é decidido pela URL (`destinoAtivo`, em rotas.js). */
export const MENU_TOPO = [
  { rotulo: "Início", icone: HomeIcon, destino: "inicio" },
  { rotulo: "Agenda", icone: CalendarIcon, destino: "agenda" },
  { rotulo: "Consultas", icone: StethoscopeIcon, destino: "consultas" },
  { rotulo: "Exames", icone: FlaskIcon, destino: "exames" },
  { rotulo: "Pacientes", icone: UsersIcon, destino: "pacientes" },
  { rotulo: "Unidade", icone: BuildingIcon, destino: "unidade" },
];

export const MENU_LATERAL = [
  { rotulo: "Início", icone: HomeIcon, destino: "inicio" },
  { rotulo: "Minha agenda", icone: CalendarIcon, destino: "agenda" },
  { rotulo: "Consultas", icone: StethoscopeIcon, destino: "consultas" },
  { rotulo: "Exames", icone: FlaskIcon, destino: "exames" },
  { rotulo: "Pacientes", icone: UsersIcon, destino: "pacientes" },
  { rotulo: "Unidade", icone: BuildingIcon, destino: "unidade" },
  { rotulo: "Meu perfil", icone: UserIcon, destino: "conta" },
];

/* Itens do menu que abre ao clicar no nome, no canto superior direito.
   "Sair" fica por último e separado dos demais de propósito: encostado nas
   outras opções, é o item que mais recebe clique por engano. */
export const MENU_PERFIL = [
  { rotulo: "Minha conta", icone: UserIcon, destino: "conta" },
  { rotulo: "Ajuda", icone: HelpIcon, destino: "ajuda" },
  { rotulo: "Sair", icone: LogoutIcon, destino: "sair", separado: true },
];
