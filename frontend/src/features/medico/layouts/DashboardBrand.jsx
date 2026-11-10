import LinkDestino from "../navegacao/LinkDestino.jsx";
import logoCruz from "../../../assets/images/logo-cruz-escuro.svg";
import styles from "./DashboardBrand.module.css";

/**
 * Marca do painel: wordmark + slogan, com o símbolo da cruz à esquerda.
 * Leva ao início do painel.
 *
 * Na casca marinho a cruz usa sempre a versão branca.
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
      <img src={logoCruz} alt="" className={styles.simbolo} />
      <span className={styles.texto}>
        <span className={styles.nome}>
          Saúde<span>Plus</span>
        </span>
        <span className={styles.slogan}>A sua saúde, sempre andando junto com você!</span>
      </span>
    </LinkDestino>
  );
}
