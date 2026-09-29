import { cx } from "../../utils/cx.js";
import styles from "./ChipList.module.css";

/** Linha "Buscas mais populares: [chip] [chip]" sobre fundo escuro. */
export default function ChipList({ label, items, activeItem, onSelect, className }) {
  return (
    <div className={cx(styles.row, className)}>
      <span className={styles.label}>{label}</span>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              className={cx(styles.chip, activeItem === item && styles.active)}
              aria-pressed={activeItem === item}
              onClick={() => onSelect?.(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
