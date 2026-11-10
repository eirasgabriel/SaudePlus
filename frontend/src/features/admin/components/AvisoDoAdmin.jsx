import styles from "./AvisoDoAdmin.module.css";

/** Faixa de retorno de uma ação na área administrativa (salvo, bloqueado, erro). */
export default function AvisoDoAdmin({ tom = "sucesso", children }) {
  if (!children) return null;
  return (
    <p className={`${styles.faixa} ${styles[tom]}`} role={tom === "erro" ? "alert" : "status"}>
      {children}
    </p>
  );
}
