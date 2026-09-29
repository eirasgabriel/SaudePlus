import Container from "../Container/Container.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./HeroSection.module.css";

/**
 * Hero azul padrão do SaúdePlus.
 *
 * - A arte (foto + fundo) tem 1536 px de largura e fica centralizada, sem distorcer.
 * - `overlay` recebe os elementos posicionados sobre a arte (FloatingInfoCard, Handwriting),
 *   usando coordenadas em px da referência 1536 × 1024.
 * - Abaixo do breakpoint a arte é trocada por `mobileSrc` e o hero empilha texto + imagem.
 *   `stackAt="md"` empilha em 960px (Homepage); `stackAt="lg"` empilha em 1180px
 *   (páginas com mais conteúdo no hero).
 * - Ajustes por página via variáveis CSS na `className`:
 *   --hero-height, --hero-content-top, --art-shift-lg
 * - `artCropBottom` oculta a faixa inferior retocada da imagem de referência;
 *   a foto se dissolve no fundo antes dessa faixa, sem deformar a proporção.
 */
export default function HeroSection({
  artSrc,
  artAlt = "",
  artHeight = 660,
  artCropBottom = 0,
  mobileSrc,
  mobileAlt = "",
  overlay,
  stackAt = "md",
  className,
  contentClassName,
  labelledBy,
  children,
}) {
  return (
    <section
      className={cx(styles.hero, stackAt === "lg" ? styles.stackLg : styles.stackMd, className)}
      style={{
        "--art-height": `${artHeight}px`,
        "--art-visible-height": `${artHeight - artCropBottom}px`,
      }}
      aria-labelledby={labelledBy}
    >
      <Container className={cx(styles.content, contentClassName)}>{children}</Container>

      <div className={styles.visual}>
        <div className={styles.art}>
          <img className={styles.artImg} src={artSrc} width="1536" height={artHeight} alt={artAlt} />
          {overlay}
        </div>
        {mobileSrc && (
          <img className={styles.mobileImg} src={mobileSrc} alt={mobileAlt} loading="lazy" />
        )}
      </div>
    </section>
  );
}

/**
 * Título do hero.
 * `lines`: linhas brancas (texto ou JSX — use <HeroAccent> para destacar parte da linha).
 * `accent`: última linha inteira em azul-ciano.
 */
export function HeroTitle({ id, lines = [], accent, className }) {
  return (
    <h1 id={id} className={cx(styles.title, className)}>
      {lines.map((line, i) => (
        <span key={i} className={styles.titleLine}>{line} </span>
      ))}
      {accent && <span className={styles.titleAccent}>{accent}</span>}
    </h1>
  );
}

/** Trecho em azul-ciano dentro de uma linha do título. */
export function HeroAccent({ children }) {
  return <span className={styles.accentInline}>{children}</span>;
}

/** Texto de apoio com as quebras de linha da referência (desktop). */
export function HeroLead({ lines = [], className }) {
  return (
    <p className={cx(styles.lead, className)}>
      {lines.map((line) => (
        <span key={line} className={styles.leadLine}>{line} </span>
      ))}
    </p>
  );
}
