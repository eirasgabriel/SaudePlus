import { ChevronRightIcon } from "../../../../components/icons/Icons.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./HelpCard.module.css";

/** Atalho azul-escuro da central de ajuda. */
export default function HelpCard({ icon: Icon, title, description = [], href, onClick, className }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag href={href} type={href ? undefined : "button"} onClick={onClick} className={cx(styles.card, className)}>
      <span className={styles.icon}><Icon size={36} /></span>
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        <span className={styles.text}>
          {description.map((line) => <span key={line}>{line} </span>)}
        </span>
      </span>
      <ChevronRightIcon size={26} className={styles.chevron} />
    </Tag>
  );
}
