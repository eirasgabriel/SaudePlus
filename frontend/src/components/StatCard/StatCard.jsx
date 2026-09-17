import { cx } from "../../utils/cx.js";
import styles from "./StatCard.module.css";

export default function StatCard({ icon: Icon, iconSize, iconStyle, value, label, className }) {
  return (
    <div className={cx(styles.stat, className)}>
      <Icon size={iconSize} style={iconStyle} />
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
