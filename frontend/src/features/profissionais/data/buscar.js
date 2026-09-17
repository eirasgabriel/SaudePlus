import { UsersIcon, CalendarIcon, ShieldHeartIcon } from "../../../components/icons/Icons.jsx";
import { SPECIALTIES } from "./specialties.js";

export const SEARCH_BENEFITS = [
  { icon: UsersIcon, iconSize: 30, title: "Profissionais verificados", description: "Especialistas de confiança" },
  { icon: CalendarIcon, iconSize: 24, title: "Agendamento online", description: "Rápido e sem complicação" },
  { icon: ShieldHeartIcon, iconSize: 28, title: "Mais segurança", description: "Seus dados sempre protegidos" },
];

export const CITIES = ["São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Curitiba - PR"];

export const CARE_TYPES = [
  { value: "presencial", label: "Consulta presencial" },
  { value: "online", label: "Consulta on-line" },
  { value: "domiciliar", label: "Atendimento domiciliar" },
];

export const SPECIALTY_NAMES = SPECIALTIES.map((s) => s.name);
export const SIDEBAR_SPECIALTIES = ["Clínico Geral", "Pediatria", "Cardiologia", "Dermatologia", "Ginecologia", "Ortopedia"];

export const INSURANCES = ["Amil", "Bradesco Saúde", "SulAmérica", "Unimed", "Outro convênio"];

export const SORT_OPTIONS = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "avaliacao", label: "Melhor avaliados" },
  { value: "avaliacoes", label: "Mais avaliações" },
  { value: "nome", label: "Nome (A–Z)" },
];
