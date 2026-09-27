import { ChevronRightIcon } from "../../../../components/icons/Icons.jsx";
import StatusTag from "../StatusTag/StatusTag.jsx";
import styles from "./AgendaList.module.css";

/**
 * Lista da agenda do dia.
 * Recebe as consultas já filtradas; a barra do cabeçalho do painel controla
 * o filtro. Cada linha é um <a> cobrindo o cartão (ver `.link::after`).
 */
export default function AgendaList({ consultas = [], statusAtivo = "todas", onLimparFiltro }) {
  if (consultas.length === 0) {
    return (
      <div className={styles.vazio}>
        <p className={styles.vazioTitulo}>Nenhuma consulta neste filtro</p>
        <p className={styles.vazioTexto}>Volte para todas as consultas do dia para ver a agenda completa.</p>
        {statusAtivo !== "todas" && (
          <button type="button" className={styles.vazioBotao} onClick={onLimparFiltro}>
            Ver todas as consultas
          </button>
        )}
      </div>
    );
  }

  return (
    <ul className={styles.lista}>
      {consultas.map(({ id, horario, paciente, tipo, status }) => (
        <li key={id} className={styles.item}>
          <span className={styles.marcador} data-status={status} aria-hidden="true" />

          <time className={styles.horario} dateTime={horario}>
            {horario}
          </time>

          <div className={styles.info}>
            <span className={styles.paciente}>{paciente}</span>
            <span className={styles.tipo}>{tipo}</span>
          </div>

          <StatusTag status={status} />

          <a href="#" className={styles.link} aria-label={`Abrir consulta de ${paciente} às ${horario}`}>
            <ChevronRightIcon size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}
