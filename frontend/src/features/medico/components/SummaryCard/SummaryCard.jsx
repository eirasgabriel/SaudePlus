import { cx } from "../../../../utils/cx.js";
import { ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./SummaryCard.module.css";

/**
 * Cartão de resumo do topo do painel.
 * O cartão inteiro é clicável: o link cobre a área com ::after, e só o
 * rótulo vai para o nome acessível — o número sozinho não descreve o destino.
 *
 * tom: "azul" | "verde" | "roxo" | "ambar"
 */
export default function SummaryCard({ icon: Icon, tom = "azul", rotulo, valor, apoio, href = "#" }) {
  return (
    <article className={cx(styles.card, styles[tom])}>
      <span className={styles.icone} aria-hidden="true">
        <Icon size={24} />
      </span>
      <h3 className={styles.rotulo}>{rotulo}</h3>
      <p className={styles.valor}>{valor}</p>
      <p className={styles.apoio}>{apoio}</p>
      <a href={href} className={styles.link} aria-label={`${rotulo}: ${valor}. Ver detalhes`}>
        <ArrowRightIcon size={18} />
      </a>
    </article>
  );
}
