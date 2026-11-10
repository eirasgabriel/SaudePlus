/* Conteúdo da página inicial */
import {
  ShieldHeartIcon, ClockIcon, StethoscopeIcon, FileTextIcon,
} from "../../../components/icons/Icons.jsx";
import { SPECIALTIES } from "../../profissionais/data/specialties.js";

export const heroContent = {
  lead: "Agende consultas, realize exames, acompanhe seu histórico e cuide da sua saúde com praticidade, segurança e confiança.",
  agendar: { label: "Agendar consulta", to: "/buscar" },
  conhecer: { label: "Conhecer a plataforma", to: "/como-funciona" },
};

/* Faixa sobre o hero: cada item responde a uma dúvida concreta de quem vai agendar. */
export const benefits = [
  { icone: ClockIcon, titulo: "Horários disponíveis", descricao: "Veja a agenda livre do profissional antes de marcar." },
  { icone: StethoscopeIcon, titulo: "Consultas e exames", descricao: "Agende os dois no mesmo lugar." },
  { icone: FileTextIcon, titulo: "Histórico organizado", descricao: "Consulte exames e resultados reunidos na sua conta." },
  { icone: ShieldHeartIcon, titulo: "Dados protegidos", descricao: "Sua conta é acessada com login e senha." },
];

/* Atalhos para a busca já filtrada — os mesmos nomes que /buscar entende. */
const DESTAQUES = ["clinico-geral", "pediatria", "ginecologia", "cardiologia", "dermatologia", "ortopedia", "oftalmologia", "psiquiatria"];
export const featuredSpecialties = DESTAQUES
  .map((slug) => SPECIALTIES.find((s) => s.slug === slug))
  .filter(Boolean);
