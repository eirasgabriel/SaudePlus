import {
  UsersIcon, UserIcon, StarIcon, HeartIcon, TargetIcon, MountainFlagIcon, EyeIcon, DiamondIcon, ChartBarsIcon,
} from "../../../components/icons/Icons.jsx";

export const ABOUT_STATS = [
  { icon: UsersIcon, iconSize: 40, value: "+ de 1 milhão", label: "de consultas realizadas" },
  { icon: UserIcon, iconSize: 34, value: "+ de 5.000", label: "profissionais de confiança" },
  { icon: StarIcon, iconSize: 36, value: "+ de 100", label: "especialidades médicas" },
  { icon: HeartIcon, iconSize: 38, value: "+ de 500 mil", label: "pacientes atendidos" },
];

export const PILLARS = [
  { icon: TargetIcon, iconSize: 40, title: "Propósito", description: "Tornar o cuidado com a saúde mais próximo, acessível e humano para todas as pessoas." },
  { icon: MountainFlagIcon, iconSize: 40, title: "Missão", description: "Conectar pacientes a profissionais de saúde qualificados, com tecnologia, segurança e simplicidade." },
  { icon: EyeIcon, iconSize: 42, title: "Visão", description: "Ser a principal plataforma de saúde do Brasil, reconhecida por transformar vidas através do acesso ao cuidado de qualidade." },
  {
    icon: DiamondIcon,
    iconSize: 40,
    title: "Valores",
    values: ["Cuidado com as pessoas", "Ética e transparência", "Inovação com propósito", "Qualidade e confiança", "Saúde para todos"],
  },
];

export const TEAM_HIGHLIGHTS = [
  { icon: UsersIcon, iconSize: 32, title: "Profissionais dedicados", description: "Um time que acredita no poder da saúde." },
  { icon: HeartIcon, iconSize: 30, title: "Trabalho com propósito", description: "Mais que um serviço, um impacto real na vida das pessoas." },
  { icon: ChartBarsIcon, iconSize: 30, title: "Sempre evoluindo", description: "Inovação constante para um cuidado ainda melhor." },
];
