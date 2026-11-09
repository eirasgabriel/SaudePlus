import { useId } from "react";
import Container from "../Container/Container.jsx";
import { CruzNeon } from "../Vitrine/Vitrine.jsx";
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
 * - `rente`: a parte útil da foto (artHeight − artCropBottom) é escalada para
 *   ocupar exatamente a altura do hero e termina rente à base dele, sem
 *   esmaecer embaixo.
 * - `cruz` ({ x, y, tamanho }, em px da arte): cruz neon ATRÁS da pessoa. A
 *   foto é um JPG só (pessoa + fundo), então a cruz é desenhada por cima com
 *   uma máscara tirada da própria foto: aparece onde o pixel é fundo azul
 *   (bem mais azul que vermelho e pouco claro) e some sobre pele, cabelo,
 *   jaleco e roupa.
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
  rente = false,
  cruz,
  className,
  contentClassName,
  labelledBy,
  children,
}) {
  const id = useId().replace(/:/g, "");
  const visivel = artHeight - artCropBottom;

  return (
    <section
      className={cx(styles.hero, stackAt === "lg" ? styles.stackLg : styles.stackMd, rente && styles.rente, className)}
      style={{
        "--art-height": `${artHeight}px`,
        "--art-visible-height": `${visivel}px`,
        "--art-visible-num": visivel,
      }}
      aria-labelledby={labelledBy}
    >
      <Container className={cx(styles.content, contentClassName)}>{children}</Container>

      <svg className={styles.waves} viewBox="0 0 1440 470" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 470V330C180 300 330 360 470 470Z" />
        <path d="M1440 0v470h-150c40-150 70-330 150-470Z" />
      </svg>

      <div className={styles.visual}>
        <div className={styles.art}>
          <img className={styles.artImg} src={artSrc} width="1536" height={artHeight} alt={artAlt} />
          {cruz && (
            <svg
              className={styles.cruzCamada}
              width="1536"
              height={artHeight}
              viewBox={`0 0 1536 ${artHeight}`}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                {/* Branco onde é fundo azul, preto onde é a pessoa:
                    v = 5·(B − R) − 3·G − 1.6, limitado a 0..1. */}
                <filter id={`fundo-${id}`} colorInterpolationFilters="sRGB">
                  <feColorMatrix
                    type="matrix"
                    values="-5 -3 5 0 -1.6  -5 -3 5 0 -1.6  -5 -3 5 0 -1.6  0 0 0 0 1"
                  />
                </filter>
                <mask id={`mascara-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height={artHeight}>
                  <image href={artSrc} width="1536" height={artHeight} filter={`url(#fundo-${id})`} />
                </mask>
              </defs>
              <g mask={`url(#mascara-${id})`}>
                <CruzNeon x={cruz.x} y={cruz.y} width={cruz.tamanho} height={cruz.tamanho} />
              </g>
            </svg>
          )}
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

/** Linha de botões abaixo do texto do hero. */
export function HeroActions({ children }) {
  return <div className={styles.actions}>{children}</div>;
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
