import { ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./ContactPanel.module.css";

/** Painel azul-escuro "Precisa de mais ajuda?" com canais de contato. */
export default function ContactPanel({ id, title, titleAccent, description, channels, className, onUnavailable }) {
  return (
    <section id={id} className={cx(styles.panel, className)} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.title}>
        {title} <span>{titleAccent}</span>
      </h2>
      <p className={styles.description}>{description}</p>

      <ul className={styles.channels}>
        {channels.map(({ icon: Icon, title: name, description: text, detail, status, hours }) => (
          <li key={name}>
            <button type="button" onClick={() => onUnavailable(name)} className={styles.channel}>
              <span className={styles.icon}><Icon size={26} /></span>
              <span className={styles.body}>
                <span className={styles.name}>{name}</span>
                <span className={styles.text}>{text}</span>
                {detail && <span className={styles.detail}>{detail}</span>}
              </span>
              {status && (
                <span className={styles.status}>
                  <span className={styles.dot} aria-hidden="true" />
                  {status}
                </span>
              )}
              {hours && (
                <span className={styles.hours}>
                  {hours.map((h) => <span key={h}>{h}</span>)}
                </span>
              )}
              <ArrowRightIcon size={22} className={styles.arrow} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
