import { useLocation } from "react-router-dom";

import { cx } from "../../../utils/cx.js";
import { HeartPulseIcon } from "../../../components/icons/Icons.jsx";
import HighlightCard from "../components/HighlightCard/HighlightCard.jsx";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import { destinoAtivo } from "../rotas.js";
import { MENU_LATERAL } from "./navigation.js";
import styles from "./DashboardSidebar.module.css";

/**
 * Barra lateral do painel.
 *
 * Cada item é um link de verdade; o da página atual fica marcado pela URL.
 * Destino ainda sem tela abre o aviso dizendo para onde iria.
 */
export default function DashboardSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className={styles.lateral} aria-label="Menu do médico">
      <nav>
        <ul className={styles.lista}>
          {MENU_LATERAL.map(({ rotulo, icone: Icone, destino }) => {
            const ativo = destinoAtivo(destino, pathname);
            return (
              <li key={rotulo}>
                <LinkDestino
                  destino={destino}
                  className={cx(styles.link, ativo && styles.ativo)}
                  aria-current={ativo ? "page" : undefined}
                >
                  <Icone size={22} className={styles.icone} />
                  {rotulo}
                </LinkDestino>
              </li>
            );
          })}
        </ul>
      </nav>

      <HighlightCard
        className={styles.cartao}
        icon={HeartPulseIcon}
        titulo="Cuidar também é tecnologia."
        texto="Mais tempo para você e para o que realmente importa: o paciente."
      />
    </aside>
  );
}
