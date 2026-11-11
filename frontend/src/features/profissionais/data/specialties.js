/* Especialidades (mock) */
import {
  SpecStethoscopeIcon, ChildIcon, FemaleIcon, HeartPulseIcon, SkinIcon, BoneIcon,
  EyeIcon, BrainIcon, MoleculeIcon, ToothIcon, LungsIcon, AppleIcon,
} from "../../../components/icons/Icons.jsx";

/* `description`: frase curta (cartões da página inicial).
   `detail`: frase mais longa (grade da página Especialidades). */
export const SPECIALTIES = [
  { slug: "clinico-geral", name: "Clínico Geral", description: "Saúde integral", detail: "Saúde integral e prevenção", icon: SpecStethoscopeIcon, iconSize: 36 },
  { slug: "pediatria", name: "Pediatria", description: "Cuidado para os pequenos", detail: "Cuidado para os pequenos", icon: ChildIcon, iconSize: 34 },
  { slug: "ginecologia", name: "Ginecologia", description: "Saúde da mulher", detail: "Saúde da mulher em todas as fases da vida", icon: FemaleIcon, iconSize: 34 },
  { slug: "cardiologia", name: "Cardiologia", description: "Saúde do coração", detail: "Prevenção, diagnóstico e tratamento do coração", icon: HeartPulseIcon, iconSize: 40 },
  { slug: "dermatologia", name: "Dermatologia", description: "Saúde da pele", detail: "Saúde da pele, cabelos e unhas", icon: SkinIcon, iconSize: 40 },
  { slug: "ortopedia", name: "Ortopedia", description: "Ossos e articulações", detail: "Cuidado com ossos, articulações e movimento", icon: BoneIcon, iconSize: 36 },
  { slug: "oftalmologia", name: "Oftalmologia", description: "Saúde da visão", detail: "Saúde da visão e dos olhos", icon: EyeIcon, iconSize: 40 },
  { slug: "psiquiatria", name: "Psiquiatria", description: "Saúde mental", detail: "Saúde mental e bem-estar emocional", icon: BrainIcon, iconSize: 38 },
  { slug: "endocrinologia", name: "Endocrinologia", description: "Hormônios e metabolismo", detail: "Hormônios, metabolismo e equilíbrio do organismo", icon: MoleculeIcon, iconSize: 34 },
  { slug: "odontologia", name: "Odontologia", description: "Saúde bucal", detail: "Saúde bucal, prevenção e tratamentos odontológicos", icon: ToothIcon, iconSize: 36 },
  { slug: "pneumologia", name: "Pneumologia", description: "Saúde respiratória", detail: "Saúde dos pulmões e do sistema respiratório", icon: LungsIcon, iconSize: 38 },
  { slug: "nutricao", name: "Nutrição", description: "Alimentação saudável", detail: "Alimentação saudável e qualidade de vida", icon: AppleIcon, iconSize: 36 },
];
