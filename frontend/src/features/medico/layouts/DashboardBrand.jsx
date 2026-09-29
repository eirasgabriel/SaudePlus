import LinkDestino from "../navegacao/LinkDestino.jsx";
import styles from "./DashboardBrand.module.css";

/**
 * Marca do painel: wordmark + slogan, como no modelo da tela.
 * Leva ao início do painel.
 *
 * O componente `src/components/Logo/Logo.jsx` (com o símbolo da cruz) segue
 * disponível, caso a equipe decida unificar a marca entre o site
 * institucional e a área logada.
 */
export default function DashboardBrand() {
  return (
    <LinkDestino
      destino="inicio"
      className={styles.marca}
      aria-label="SaúdePlus, início do painel"
    >
      <span className={styles.nome}>
        Saúde<span>Plus</span>
      </span>
      <span className={styles.slogan}>A sua saúde, sempre andando junto com você!</span>
    </LinkDestino>
  );
}
