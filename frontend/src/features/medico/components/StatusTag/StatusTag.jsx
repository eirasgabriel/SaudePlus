import { STATUS_CONSULTA } from "../../data/medico.js";
import styles from "./StatusTag.module.css";

/**
 * Selo de status de uma consulta.
 * O rótulo e a cor vêm de STATUS_CONSULTA — não são escritos no JSX.
 * Status desconhecido cai num tom neutro em vez de quebrar a tela.
 */
export default function StatusTag({ status }) {
  const info = STATUS_CONSULTA[status] ?? { rotulo: status, tom: "neutro" };
  return <span className={`${styles.tag} ${styles[info.tom] ?? styles.neutro}`}>{info.rotulo}</span>;
}
