/* Navegação do painel do médico.
   Os `href` são provisórios: quando o React Router cobrir a área logada,
   troque por `to` e use <NavLink>, como no Header institucional. */

import { CalendarIcon, StethoscopeIcon, UsersIcon, BuildingIcon, UserIcon } from "../../../components/icons/Icons.jsx";
import { HomeIcon, FlaskIcon } from "../components/icons/MedicoIcons.jsx";

export const MENU_TOPO = [
  { rotulo: "Início", icone: HomeIcon, href: "#", ativo: true },
  { rotulo: "Agenda", icone: CalendarIcon, href: "#" },
  { rotulo: "Consultas", icone: StethoscopeIcon, href: "#" },
  { rotulo: "Exames", icone: FlaskIcon, href: "#" },
  { rotulo: "Pacientes", icone: UsersIcon, href: "#" },
  { rotulo: "Unidade", icone: BuildingIcon, href: "#" },
];

export const MENU_LATERAL = [
  { rotulo: "Início", icone: HomeIcon, href: "#", ativo: true },
  { rotulo: "Minha agenda", icone: CalendarIcon, href: "#" },
  { rotulo: "Consultas", icone: StethoscopeIcon, href: "#" },
  { rotulo: "Exames", icone: FlaskIcon, href: "#" },
  { rotulo: "Pacientes", icone: UsersIcon, href: "#" },
  { rotulo: "Unidade", icone: BuildingIcon, href: "#" },
  { rotulo: "Meu perfil", icone: UserIcon, href: "#" },
];
