import { ArrowRightIcon, CalendarIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./DayAgendaCard.module.css";

/**
 * Cartão azul do topo da coluna direita: o que está acontecendo agora e o
 * que vem a seguir. É o primeiro lugar para onde o olho vai, então mostra a
 * informação mais útil do momento em vez de uma frase decorativa.
 *
 * `atual`: consulta em andamento (ou null). `proxima`: a próxima que ainda
 * não começou (ou null). `restantes`: quantas ainda não começaram.
 */
export default function DayAgendaCard({ data, atual, proxima, restantes = 0, tituloId, aoVerProximas }) {
  const vazio = !atual && !proxima;

  return (
    <section className={styles.cartao} aria-labelledby={tituloId}>
      <header className={styles.cabecalho}>
        <span className={styles.icone} aria-hidden="true">
          <CalendarIcon size={22} />
        </span>
        <h2 id={tituloId} className={styles.titulo}>
          Agenda do dia
        </h2>
        <span className={styles.data}>{data}</span>
      </header>

      {vazio ? (
        <p className={styles.vazio}>Nenhuma consulta pendente hoje.</p>
      ) : (
        <dl className={styles.blocos}>
          {atual && (
            <div className={styles.bloco}>
              <dt className={styles.rotulo}>Em atendimento</dt>
              <dd className={styles.linha}>
                <span className={styles.hora}>{atual.horario}</span>
                <span className={styles.paciente}>{atual.paciente}</span>
              </dd>
              <dd className={styles.tipo}>{atual.tipo}</dd>
            </div>
          )}
          {proxima && (
            <div className={styles.bloco}>
              <dt className={styles.rotulo}>Próxima</dt>
              <dd className={styles.linha}>
                <span className={styles.hora}>{proxima.horario}</span>
                <span className={styles.paciente}>{proxima.paciente}</span>
              </dd>
              <dd className={styles.tipo}>{proxima.tipo}</dd>
            </div>
          )}
        </dl>
      )}

      {restantes > 0 && aoVerProximas && (
        <button type="button" className={styles.acao} onClick={aoVerProximas}>
          {restantes === 1 ? "1 consulta a seguir" : `${restantes} consultas a seguir`}
          <ArrowRightIcon size={16} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
