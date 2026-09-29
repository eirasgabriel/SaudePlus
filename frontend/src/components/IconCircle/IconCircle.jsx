import { cx } from "../../utils/cx.js";
import styles from "./IconCircle.module.css";

/**
 * Ícone dentro de círculo.
 * tone: "light" (fundo azul-claro, ícone azul) | "solid" (azul, ícone branco) | "glass" (sobre fundo escuro)
 */
export default function IconCircle({ icon: Icon, size = 80, iconSize = 40, tone = "light", className }) {
  return (
    <span className={cx(styles.circle, styles[tone], className)} style={{ width: size, height: size }}>
      <Icon size={iconSize} />
    </span>
  );
}
