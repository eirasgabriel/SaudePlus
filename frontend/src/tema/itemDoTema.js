import { MoonIcon, SunIcon } from "../features/medico/components/icons/MedicoIcons.jsx";

/** Item "Modo escuro" do menu da conta (MenuPerfil), igual em todas as áreas. */
export function itemDoTema(tema, alternarTema) {
  const escuro = tema === "escuro";
  return {
    rotulo: "Modo escuro",
    icone: escuro ? MoonIcon : SunIcon,
    alternar: { ligado: escuro, aoAlternar: alternarTema },
  };
}
