import { cx } from "../../../../utils/cx.js";
import { ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./SummaryCard.module.css";

/**
 * Cartão de resumo do topo do painel.
 *
 * O cartão inteiro é clicável: o botão cobre a área com ::after. Só o rótulo
 * e a ação vão para o nome acessível — o número sozinho não descreve o
 * destino ("8" não diz nada; "Consultas hoje: 8. Ver a agenda do dia" diz).
 *
 * `aoClicar` é obrigatório: um cartão de resumo sem ação é um número morto
 * na tela. Se um cartão novo ainda não tiver para onde ir, mande
 * `() => irPara("destino")` e ele já entra com o aviso de "em breve".
 *
 * tom: "azul" | "verde" | "roxo" | "ambar"
 */
export default function SummaryCard({
  icon: Icon,
  tom = "azul",
  rotulo,
  valor,
  apoio,
  acao = "Ver detalhes",
  aoClicar,
}) {
  return (
    <article className={cx(styles.card, styles[tom])}>
      <span className={styles.icone} aria-hidden="true">
        <Icon size={24} />
      </span>
      <h3 className={styles.rotulo}>{rotulo}</h3>
      <p className={styles.valor}>{valor}</p>
      <p className={styles.apoio}>{apoio}</p>
      <button
        type="button"
        className={styles.link}
        aria-label={`${rotulo}: ${valor}. ${acao}`}
        onClick={aoClicar}
      >
        <ArrowRightIcon size={18} />
      </button>
    </article>
  );
}
