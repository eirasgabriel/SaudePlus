import { ChevronRightIcon } from "../../../../components/icons/Icons.jsx";
import { iniciais } from "../../selectors.js";
import styles from "./PatientList.module.css";

/** Lista de pacientes do médico. As iniciais do avatar vêm do nome. */
export default function PatientList({ pacientes = [], limite }) {
  const visiveis = typeof limite === "number" ? pacientes.slice(0, limite) : pacientes;

  return (
    <ul className={styles.lista}>
      {visiveis.map(({ id, nome, idade, motivo }) => (
        <li key={id} className={styles.item}>
          <span className={styles.avatar} aria-hidden="true">
            {iniciais(nome)}
          </span>

          <div className={styles.info}>
            <span className={styles.nome}>{nome}</span>
            <span className={styles.meta}>
              {idade} anos <span aria-hidden="true">•</span> {motivo}
            </span>
          </div>

          <a href="#" className={styles.link} aria-label={`Abrir prontuário de ${nome}`}>
            <ChevronRightIcon size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}
