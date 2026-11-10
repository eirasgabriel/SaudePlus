import Container from "../Container/Container.jsx";
import IconCircle from "../IconCircle/IconCircle.jsx";
import { CruzNeon } from "../Vitrine/Vitrine.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./CTABand.module.css";

/**
 * Faixa de chamada que fecha as páginas públicas.
 *
 * - `tone="blue"`: degradê azul com ondas e a cruz neon à direita.
 * - `tone="light"`: cartão branco, ícone em ladrilho e título com destaque azul.
 * - `icon` (opcional) aparece num ladrilho à esquerda, separado por um traço.
 * - `accentBlock`: o trecho em destaque desce para a linha de baixo.
 * - `aside` (opcional): texto de apoio à direita do título, após um traço.
 * - `iconTone="dark"`: ladrilho escuro com o ícone em ciano (na faixa azul).
 * - `cross={false}` tira a cruz neon da faixa azul.
 */
export default function CTABand({
  icon, title, titleAccent, accentBlock = false, subtitle, aside, action, tone = "blue", iconTone, cross = true, className,
}) {
  const azul = tone === "blue";

  return (
    <Container as="section" className={cx(styles.band, azul ? styles.blue : styles.light, className)}>
      {azul && (
        <>
          <svg className={styles.waves} viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M760 200C860 120 960 40 1200 20V200Z" />
            <path d="M880 200C980 150 1080 110 1200 100V200Z" />
          </svg>
          {cross && <CruzNeon className={styles.cross} />}
        </>
      )}

      {icon && (
        <IconCircle icon={icon} size={64} iconSize={34} className={cx(styles.icon, iconTone === "dark" && styles.iconDark)} />
      )}

      <div className={styles.heading}>
        <h2 className={styles.title}>
          {title}
          {titleAccent && <> <span className={cx(styles.accent, accentBlock && styles.accentBlock)}>{titleAccent}</span></>}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {aside && <p className={styles.aside}>{aside}</p>}

      {action && <div className={styles.action}>{action}</div>}
    </Container>
  );
}
