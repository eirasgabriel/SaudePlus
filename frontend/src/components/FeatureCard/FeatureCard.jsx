import { cx } from "../../utils/cx.js";
import styles from "./FeatureCard.module.css";

/** Ícone em círculo azul-claro + título + descrição (centralizado). */
export default function FeatureCard({ icon: Icon, iconSize, title, description, className }) {
  return (
    <article className={cx(styles.feature, className)}>
      <span className={styles.iconCircle}>
        <Icon size={iconSize} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>
        {description.map((line, i) => (
          <span key={i} className={styles.line}>{line}</span>
        ))}
      </p>
    </article>
  );
}
