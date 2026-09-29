import { FileTextIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./PendingExamList.module.css";

/** Exames aguardando resultado, com o prazo alinhado à direita. */
export default function PendingExamList({ exames = [] }) {
  if (exames.length === 0) {
    return <p className={styles.vazio}>Nenhum exame aguardando resultado.</p>;
  }

  return (
    <ul className={styles.lista}>
      {exames.map(({ id, nome, paciente, prazo }) => (
        <li key={id} className={styles.item}>
          <span className={styles.icone} aria-hidden="true">
            <FileTextIcon size={18} />
          </span>

          <div className={styles.info}>
            <span className={styles.nome}>{nome}</span>
            <span className={styles.paciente}>{paciente}</span>
          </div>

          <span className={styles.prazo}>{prazo}</span>
        </li>
      ))}
    </ul>
  );
}
