import { cx } from "../../../utils/cx.js";
import { HeartPulseIcon } from "../../../components/icons/Icons.jsx";
import HighlightCard from "../components/HighlightCard/HighlightCard.jsx";
import { MENU_LATERAL } from "./navigation.js";
import styles from "./DashboardSidebar.module.css";

/** Barra lateral do painel: navegação do médico e cartão de rodapé. */
export default function DashboardSidebar() {
  return (
    <aside className={styles.lateral} aria-label="Menu do médico">
      <nav>
        <ul className={styles.lista}>
          {MENU_LATERAL.map(({ rotulo, icone: Icone, href, ativo }) => (
            <li key={rotulo}>
              <a
                href={href}
                className={cx(styles.link, ativo && styles.ativo)}
                aria-current={ativo ? "page" : undefined}
              >
                <Icone size={22} className={styles.icone} />
                {rotulo}
              </a>
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
