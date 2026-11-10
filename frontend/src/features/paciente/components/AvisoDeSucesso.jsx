import styles from "./AvisoDeSucesso.module.css";

/** Faixa de confirmação depois de uma ação (consulta agendada, remarcada...). */
export default function AvisoDeSucesso({ children }) {
  if (!children) return null;
  return (
    <p className={styles.faixa} role="status">
      {children}
    </p>
  );
}
