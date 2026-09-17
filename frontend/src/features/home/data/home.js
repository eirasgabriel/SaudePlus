/* Conteúdo mockado da Homepage */
import { CalendarIcon, UsersIcon, ShieldHeartIcon, HeartIcon, StarIcon } from "../../../components/icons/Icons.jsx";

export const heroContent = {
  badge: "Saúde mais perto de você",
  titleLines: ["Agende suas", "consultas on-line"],
  titleAccent: "com mais facilidade",
  leadLines: [
    "No SaúdePlus você encontra profissionais de confiança,",
    "verifica horários disponíveis e agenda sua consulta",
    "de forma rápida, segura e sem complicação.",
  ],
  cta: { label: "Agendar agora", to: "/buscar" },
};

export const benefits = [
  { icon: CalendarIcon, iconSize: 42, title: "Agende em minutos", description: ["Escolha o melhor horário", "para você."] },
  { icon: UsersIcon, iconSize: 54, title: "Profissionais de confiança", description: ["Encontre especialistas", "perto de você."] },
  { icon: ShieldHeartIcon, iconSize: 40, title: "Atendimento seguro", description: ["Seus dados protegidos", "sempre."] },
  { icon: HeartIcon, iconSize: 46, title: "Mais qualidade de vida", description: ["Cuidar da sua saúde", "é viver melhor."] },
];

export const trustContent = {
  title: "Sua saúde em",
  titleAccent: "boas mãos",
  text: "No SaúdePlus, tecnologia e cuidado caminham juntos para você ter uma experiência simples e confiável.",
};

export const stats = [
  { icon: UsersIcon, iconSize: 56, iconStyle: { marginBottom: -10 }, value: "+ de 5.000", label: "profissionais" },
  { icon: StarIcon, iconSize: 40, iconStyle: { marginTop: 6 }, value: "+ de 100", label: "especialidades" },
  { icon: UsersIcon, iconSize: 56, iconStyle: { marginBottom: -10 }, value: "+ de 1 milhão", label: "de consultas realizadas" },
];
