import { cx } from "../../../../utils/cx.js";
import { ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./Panel.module.css";

/**
 * Cartão branco com cabeçalho (ícone + título) e ação opcional à direita.
 * Base visual de "Minha agenda de hoje", "Seus pacientes", "Exames pendentes",
 * "Notificações" e "Unidade".
 *
 * `titleId` é obrigatório: liga o <h2> ao aria-labelledby da <section>.
 */
export default function Panel({
  icon: Icon,
  titulo,
  titleId,
  acao,
  aside,
  className,
  bodyClassName,
  children,
}) {
  return (
    <section className={cx(styles.panel, className)} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div className={styles.tituloGrupo}>
          {Icon && (
            <span className={styles.icone} aria-hidden="true">
              <Icon size={18} />
            </span>
          )}
          <h2 id={titleId} className={styles.titulo}>
            {titulo}
          </h2>
        </div>
        {aside}
        {acao && (
          <a href={acao.href} className={styles.acao}>
            {acao.rotulo}
            <ArrowRightIcon size={15} className={styles.acaoIcone} />
          </a>
        )}
      </header>
      <div className={cx(styles.corpo, bodyClassName)}>{children}</div>
    </section>
  );
}
