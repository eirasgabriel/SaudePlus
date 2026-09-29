import { StarIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./Rating.module.css";

export default function Rating({ value, reviews, size = "md", className }) {
  return (
    <p className={cx(styles.rating, styles[size], className)}>
      <StarIcon size={size === "sm" ? 16 : 20} className={styles.star} />
      <strong>{value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong>
      <span className={styles.reviews}>({reviews} avaliações)</span>
      <span className="sr-only">de 5 estrelas</span>
    </p>
  );
}
