import { cx } from "../../../../utils/cx.js";
import styles from "./HighlightCard.module.css";

/**
 * Cartão azul-claro decorativo com ícone, título e texto opcional.
 * Usado no rodapé da barra lateral e da coluna direita.
 *
 * variante: "coluna" (ícone acima do texto) | "linha" (ícone à esquerda)
 */
export default function HighlightCard({ icon: Icon, titulo, texto, variante = "coluna", className }) {
  return (
    <aside className={cx(styles.cartao, styles[variante], className)}>
      <span className={styles.icone} aria-hidden="true">
        <Icon size={30} />
      </span>
      <div className={styles.conteudo}>
        <p className={styles.titulo}>{titulo}</p>
        {texto && <p className={styles.texto}>{texto}</p>}
      </div>
      <span className={styles.onda} aria-hidden="true" />
    </aside>
  );
}
