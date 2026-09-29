import { cx } from "../../../utils/cx.js";
import { HeartPulseIcon } from "../../../components/icons/Icons.jsx";
import HighlightCard from "../components/HighlightCard/HighlightCard.jsx";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import { MENU_LATERAL } from "./navigation.js";
import styles from "./DashboardSidebar.module.css";

/**
 * Barra lateral do painel.
 *
 * Cada item é um link de verdade, com o caminho futuro no `href`. Como as
 * telas ainda não existem, o clique abre o aviso dizendo o destino em vez de
 * levar a um 404.
 */
export default function DashboardSidebar() {
  return (
    <aside className={styles.lateral} aria-label="Menu do médico">
      <nav>
        <ul className={styles.lista}>
          {MENU_LATERAL.map(({ rotulo, icone: Icone, destino, ativo }) => (
            <li key={rotulo}>
              {/* ATIVAR ROTAS (passo 4): LinkDestino vira <NavLink> e o
                  `ativo` sai de navigation.js. */}
              <LinkDestino
                destino={destino}
                className={cx(styles.link, ativo && styles.ativo)}
                aria-current={ativo ? "page" : undefined}
              >
                <Icone size={22} className={styles.icone} />
                {rotulo}
              </LinkDestino>
            </li>
          ))}
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
