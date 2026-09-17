import { ChevronDownIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./SelectField.module.css";

/** Select nativo com ícone, rótulo e seta — acessível e sem dependências. */
export default function SelectField({ id, icon: Icon, iconSize = 30, label, value, onChange, options, className }) {
  return (
    <div className={cx(styles.field, className)}>
      {Icon && <Icon size={iconSize} className={styles.icon} />}
      <div className={styles.body}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        <select id={id} className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => {
            const { value: v, label: l } = typeof opt === "string" ? { value: opt, label: opt } : opt;
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
      </div>
      <ChevronDownIcon size={22} className={styles.chevron} />
    </div>
  );
}
