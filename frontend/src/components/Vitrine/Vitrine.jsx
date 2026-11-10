import { useId } from "react";
import { Link } from "react-router-dom";
import Container from "../Container/Container.jsx";
import IconCircle from "../IconCircle/IconCircle.jsx";
import { ArrowRightIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./Vitrine.module.css";

/*
 * Peças das páginas públicas (Início, Especialidades, Como funciona, Sobre nós
 * e Ajuda): cruz neon do hero, título central com traços, cartão com ícone à
 * esquerda e a faixa de destaques que sobrepõe o hero.
 */

/**
 * Cruz em contorno ciano com brilho. Decorativa.
 * Dentro de outro SVG, `x`, `y`, `width` e `height` a posicionam.
 */
export function CruzNeon({ className, ...posicao }) {
  return (
    <svg
      className={cx(styles.cruz, className)}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...posicao}
    >
      <path
        className={styles.cruzBrilho}
        d="M78 14h44a10 10 0 0 1 10 10v44h44a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10h-44v44a10 10 0 0 1-10 10H78a10 10 0 0 1-10-10v-44H24a10 10 0 0 1-10-10V78a10 10 0 0 1 10-10h44V24a10 10 0 0 1 10-10Z"
      />
      <path
        className={styles.cruzTraco}
        d="M78 14h44a10 10 0 0 1 10 10v44h44a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10h-44v44a10 10 0 0 1-10 10H78a10 10 0 0 1-10-10v-44H24a10 10 0 0 1-10-10V78a10 10 0 0 1 10-10h44V24a10 10 0 0 1 10-10Z"
      />
    </svg>
  );
}

/** Título de seção centralizado, com traços dos dois lados e trecho em azul. */
export function TituloCentral({ id, children, destaque, className }) {
  return (
    <h2 id={id} className={cx(styles.tituloCentral, className)}>
      <span>
        {children}
        {destaque && <> <span className={styles.destaque}>{destaque}</span></>}
      </span>
    </h2>
  );
}

/** Cartão branco: ladrilho de ícone à esquerda, título e descrição. */
export function CartaoIcone({ icone, titulo, descricao, as: Tag = "article", className }) {
  return (
    <Tag className={cx(styles.cartao, className)}>
      <IconCircle icon={icone} size={60} iconSize={34} className={styles.ladrilho} />
      <div>
        <h3 className={styles.cartaoTitulo}>{titulo}</h3>
        {descricao && <p className={styles.cartaoTexto}>{descricao}</p>}
      </div>
    </Tag>
  );
}

/** Grade de CartaoIcone, em 4 colunas no desktop. */
export function GradeCartoes({ itens, className, rotulo }) {
  return (
    <ul className={cx(styles.grade, className)} aria-label={rotulo}>
      {itens.map((item) => (
        <li key={item.titulo}>
          <CartaoIcone as="div" {...item} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Faixa branca com itens separados por traços. Por padrão sobrepõe a base do
 * hero; com `sobreposta={false}` fica no fluxo normal da página.
 * Com `titulo` (e `destaque`), mostra um título central dentro do cartão.
 * Cada item pode ser estático, um link interno (`para`), uma âncora (`href`)
 * ou um botão (`aoClicar`); os que levam a algum lugar ganham uma seta.
 */
export function FaixaDestaques({ itens, rotulo, titulo, destaque, sobreposta = true, className, ...props }) {
  const idTitulo = useId();

  return (
    <Container
      as="section"
      className={cx(styles.faixa, !sobreposta && styles.faixaNoFluxo, className)}
      aria-label={titulo ? undefined : rotulo}
      aria-labelledby={titulo ? idTitulo : undefined}
      {...props}
    >
      {titulo && (
        <TituloCentral id={idTitulo} destaque={destaque} className={styles.faixaCabecalho}>
          {titulo}
        </TituloCentral>
      )}
      <ul className={styles.faixaLista}>
        {itens.map(({ icone, titulo, descricao, para, href, aoClicar }) => {
          const interativo = Boolean(para || href || aoClicar);
          const conteudo = (
            <>
              <IconCircle icon={icone} size={56} iconSize={30} className={styles.ladrilho} />
              <span className={styles.faixaCorpo}>
                <span className={styles.faixaTitulo}>{titulo}</span>
                <span className={styles.faixaTexto}>
                  {descricao}
                  {interativo && <ArrowRightIcon size={18} className={styles.faixaSeta} />}
                </span>
              </span>
            </>
          );
          return (
            <li key={titulo} className={styles.faixaItem}>
              {para ? (
                <Link to={para} className={styles.faixaAcao}>{conteudo}</Link>
              ) : href ? (
                <a href={href} className={styles.faixaAcao}>{conteudo}</a>
              ) : aoClicar ? (
                <button type="button" onClick={aoClicar} className={styles.faixaAcao}>{conteudo}</button>
              ) : (
                <div className={styles.faixaAcao}>{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
