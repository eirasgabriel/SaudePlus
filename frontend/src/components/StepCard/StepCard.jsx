import IconCircle from "../IconCircle/IconCircle.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./StepCard.module.css";

/** Etapa numerada: número + ícone em círculo + título + descrição. */
export default function StepCard({ number, icon, iconSize = 38, title, description = [], className }) {
  return (
    <li className={cx(styles.card, className)}>
      <span className={styles.number} aria-hidden="true">{number}</span>
      <IconCircle icon={icon} size={68} iconSize={iconSize} className={styles.icon} />
      <h3 className={styles.title}>
        <span className="sr-only">Etapa {number}: </span>
        {title}
      </h3>
      <p className={styles.text}>
        {description.map((line) => <span key={line}>{line}</span>)}
      </p>
    </li>
  );
}
