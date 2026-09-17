import { cx } from "../../utils/cx.js";
import styles from "./Badge.module.css";

export default function Badge({ className, children }) {
  return <span className={cx(styles.badge, className)}>{children}</span>;
}
