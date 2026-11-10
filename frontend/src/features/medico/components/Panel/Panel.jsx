import { cx } from "../../../../utils/cx.js";
import { ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import LinkDestino from "../../navegacao/LinkDestino.jsx";
import styles from "./Panel.module.css";

/**
 * Cartão branco com cabeçalho (ícone + título) e ação opcional à direita.
 * Base de "Minha agenda de hoje", "Seus pacientes", "Exames pendentes",
 * "Notificações" e "Unidade".
 *
 * `titleId` é obrigatório: liga o <h2> ao aria-labelledby da <section> e é
 * também o alvo de `irAtePainel` (foco.js), usado pelos atalhos da tela.
 *
 * `acao` é `{ rotulo, destino }` — "Ver todos" leva à listagem completa, que
 * é uma página. Por isso é um link, e não um botão.
 * ATIVAR ROTAS: nada muda aqui — quem passa a navegar é o LinkDestino.
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
          {/* tabIndex -1: o título não entra na ordem de Tab, mas pode
              receber foco por código quando um atalho traz a pessoa até aqui. */}
          <h2 id={titleId} className={styles.titulo} tabIndex={-1}>
            {titulo}
          </h2>
        </div>
        {aside}
        {acao && (
          <LinkDestino destino={acao.destino} className={styles.acao}>
            {acao.rotulo}
            <ArrowRightIcon size={15} className={styles.acaoIcone} />
          </LinkDestino>
        )}
      </header>
      <div className={cx(styles.corpo, bodyClassName)}>{children}</div>
    </section>
  );
}
