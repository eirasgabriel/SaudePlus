import ListaSuspensa from "../ListaSuspensa/ListaSuspensa.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./SelectField.module.css";

/**
 * Campo de escolha com ícone, rótulo e seta. A lista que abre usa o visual do
 * site (ListaSuspensa), não a do navegador, para seguir o tema claro/escuro.
 */
export default function SelectField({ id, icon: Icon, iconSize = 30, label, value, onChange, options, className }) {
  const rotuloId = `${id}-rotulo`;
  return (
    <div className={cx(styles.field, className)}>
      {Icon && <Icon size={iconSize} className={styles.icon} />}
      <div className={styles.body}>
        <span id={rotuloId} className={styles.label}>{label}</span>
        <ListaSuspensa
          id={id}
          labelledBy={rotuloId}
          value={value}
          onChange={onChange}
          options={options}
          className={styles.select}
          raizClassName={styles.ancora}
          listaClassName={styles.lista}
        />
      </div>
    </div>
  );
}
