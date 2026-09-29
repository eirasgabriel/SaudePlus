import { cx } from "../../utils/cx.js";
import styles from "./FloatingInfoCard.module.css";

/**
 * Card branco flutuante sobre a arte do hero.
 * A posição (left/top/width/height) vem pela `className` da página.
 * iconVariant: "circle" (branco em círculo azul) | "soft" (azul em círculo azul-claro) | "plain" (azul)
 * `highlight` (opcional) aparece em azul na primeira linha; `lines` são as demais linhas.
 */
export default function FloatingInfoCard({ icon: Icon, iconSize = 24, iconVariant = "circle", highlight, lines = [], className }) {
  return (
    <div className={cx(styles.card, className)}>
      {iconVariant === "plain" ? (
        <Icon size={iconSize} className={styles.iconPlain} />
      ) : (
        <span className={cx(styles.iconCircle, iconVariant === "soft" && styles.iconSoft)}>
          <Icon size={iconSize} />
        </span>
      )}
      <p>
        {highlight && <span className={styles.highlight}>{highlight}</span>}
        {lines.map((line, i) => (
          <span key={i}>
            {(i > 0 || highlight) && <br />}
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}
