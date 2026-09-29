import { Link } from "react-router-dom";
import IconCircle from "../../../../components/IconCircle/IconCircle.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./SpecialtyCard.module.css";

export default function SpecialtyCard({ name, description, icon, iconSize, to, className }) {
  return (
    <Link to={to} className={cx(styles.card, className)}>
      <IconCircle icon={icon} size={58} iconSize={iconSize} />
      <span className={styles.text}>
        <span className={styles.name}>{name}</span>
        <span className={styles.description}>{description}</span>
      </span>
    </Link>
  );
}
