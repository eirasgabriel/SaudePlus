import { HeartOutlineIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./Handwriting.module.css";

const DEFAULT_LINES = ["A sua Saúde,", "sempre andando", "junto com você!"];

/** Frase manuscrita com coração. Posição definida pela `className` da página. */
export default function Handwriting({ lines = DEFAULT_LINES, className }) {
  return (
    <div className={cx(styles.wrap, className)} aria-hidden="true">
      <p className={styles.text}>
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      <HeartOutlineIcon className={styles.heart} />
    </div>
  );
}
