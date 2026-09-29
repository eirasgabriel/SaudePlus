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

/* `ativo: true` no Início é provisório: esta é a única tela que existe, então
   ela é sempre a atual. Com o router, quem decide passa a ser o `isActive` do
   NavLink e este campo sai daqui. */
export const MENU_TOPO = [
  { rotulo: "Início", icone: HomeIcon, destino: "inicio", ativo: true },
  { rotulo: "Agenda", icone: CalendarIcon, destino: "agenda" },
  { rotulo: "Consultas", icone: StethoscopeIcon, destino: "consultas" },
  { rotulo: "Exames", icone: FlaskIcon, destino: "exames" },
  { rotulo: "Pacientes", icone: UsersIcon, destino: "pacientes" },
  { rotulo: "Unidade", icone: BuildingIcon, destino: "unidade" },
];

export const MENU_LATERAL = [
  { rotulo: "Início", icone: HomeIcon, destino: "inicio", ativo: true },
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
