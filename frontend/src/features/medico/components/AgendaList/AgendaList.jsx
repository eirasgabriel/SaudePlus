import { ChevronRightIcon } from "../../../../components/icons/Icons.jsx";
import LinkDestino from "../../navegacao/LinkDestino.jsx";
import StatusTag from "../StatusTag/StatusTag.jsx";
import styles from "./AgendaList.module.css";

/**
 * Lista da agenda do dia.
 *
 * Recebe as consultas já filtradas; quem controla o filtro é a barra no
 * cabeçalho do painel. A linha inteira é clicável: o botão do fim cobre o
 * cartão pelo `.link::after`, então não existe área morta.
 *
 * Cada linha é um link para /medico/consultas/:consultaId. Enquanto a tela de
 * detalhe não existir, o clique abre o aviso dizendo o destino.
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

          <LinkDestino
            destino="consulta"
            parametros={{ consultaId: id }}
            detalhe={`${paciente} às ${horario}`}
            className={styles.link}
            aria-label={`Abrir consulta de ${paciente} às ${horario}`}
          >
            <ChevronRightIcon size={18} />
          </LinkDestino>
        </li>
      ))}
    </ul>
  );
}
