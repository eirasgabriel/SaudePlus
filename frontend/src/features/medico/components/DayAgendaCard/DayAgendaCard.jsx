import { CalendarIcon, HeartOutlineIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./DayAgendaCard.module.css";

/** Cartão azul do topo da coluna direita: data do painel e frase do dia. */
export default function DayAgendaCard({ data, frase, tituloId }) {
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

      <figure className={styles.citacao}>
        <blockquote className={styles.frase}>{frase}</blockquote>
        <HeartOutlineIcon size={26} className={styles.coracao} />
      </figure>
    </section>
  );
}
