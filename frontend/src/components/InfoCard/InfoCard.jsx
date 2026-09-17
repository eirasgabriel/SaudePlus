import IconCircle from "../IconCircle/IconCircle.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./InfoCard.module.css";

/** Card horizontal: ícone em círculo à esquerda, título e descrição à direita. */
export default function InfoCard({ as: Tag = "article", icon, iconSize = 40, circleSize = 80, title, description, children, className }) {
  return (
    <Tag className={cx(styles.card, className)}>
      <IconCircle icon={icon} size={circleSize} iconSize={iconSize} />
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.text}>
            {Array.isArray(description)
              ? description.map((line) => <span key={line} className={styles.line}>{line} </span>)
              : description}
          </p>
        )}
        {children}
      </div>
    </Tag>
  );
}
