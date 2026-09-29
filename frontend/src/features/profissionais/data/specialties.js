/* Especialidades (mock) */
import {
  SpecStethoscopeIcon, ChildIcon, FemaleIcon, HeartPulseIcon, SkinIcon, BoneIcon,
  EyeIcon, BrainIcon, MoleculeIcon, ToothIcon, LungsIcon, AppleIcon,
} from "../../../components/icons/Icons.jsx";

export const SPECIALTIES = [
  { slug: "clinico-geral", name: "Clínico Geral", description: "Saúde integral", icon: SpecStethoscopeIcon, iconSize: 36 },
  { slug: "pediatria", name: "Pediatria", description: "Cuidado para os pequenos", icon: ChildIcon, iconSize: 34 },
  { slug: "ginecologia", name: "Ginecologia", description: "Saúde da mulher", icon: FemaleIcon, iconSize: 34 },
  { slug: "cardiologia", name: "Cardiologia", description: "Saúde do coração", icon: HeartPulseIcon, iconSize: 40 },
  { slug: "dermatologia", name: "Dermatologia", description: "Saúde da pele", icon: SkinIcon, iconSize: 40 },
  { slug: "ortopedia", name: "Ortopedia", description: "Ossos e articulações", icon: BoneIcon, iconSize: 36 },
  { slug: "oftalmologia", name: "Oftalmologia", description: "Saúde da visão", icon: EyeIcon, iconSize: 40 },
  { slug: "psiquiatria", name: "Psiquiatria", description: "Saúde mental", icon: BrainIcon, iconSize: 38 },
  { slug: "endocrinologia", name: "Endocrinologia", description: "Hormônios e metabolismo", icon: MoleculeIcon, iconSize: 34 },
  { slug: "odontologia", name: "Odontologia", description: "Saúde bucal", icon: ToothIcon, iconSize: 36 },
  { slug: "pneumologia", name: "Pneumologia", description: "Saúde respiratória", icon: LungsIcon, iconSize: 38 },
  { slug: "nutricao", name: "Nutrição", description: "Alimentação saudável", icon: AppleIcon, iconSize: 36 },
];

export const POPULAR_SPECIALTIES = ["Clínico Geral", "Pediatria", "Cardiologia", "Dermatologia", "Ginecologia"];
