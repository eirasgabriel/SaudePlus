import styles from "./DashboardBrand.module.css";

/**
 * Marca do painel: wordmark + slogan, como no modelo da tela.
 *
 * O componente `src/components/Logo/Logo.jsx` (com o símbolo da cruz) segue
 * disponível e é uma troca de uma linha caso a equipe decida unificar a marca
 * entre o site institucional e a área logada. Ele depende do React Router,
 * então exige envolver o painel num <BrowserRouter>.
 */
export default function DashboardBrand({ href = "#" }) {
  return (
    <a href={href} className={styles.marca} aria-label="SaúdePlus, página inicial do painel">
      <span className={styles.nome}>
        Saúde<span>Plus</span>
      </span>
      <span className={styles.slogan}>A sua saúde, sempre andando junto com você!</span>
    </a>
  );
}
