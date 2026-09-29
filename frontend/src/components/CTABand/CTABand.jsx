import Container from "../Container/Container.jsx";
import IconCircle from "../IconCircle/IconCircle.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./CTABand.module.css";

/**
 * Faixa horizontal azul-escura.
 * Slots: icon · title/titleAccent · subtitle · aside (texto após divisória) · action (botão)
 * layout: "split" (título | divisória | texto | botão) ou "stacked" (título+subtítulo | botão | divisória | texto)
 */
export default function CTABand({
  icon,
  title,
  titleAccent,
  accentInline = false,
  subtitle,
  aside,
  action,
  layout = "split",
  className,
}) {
  return (
    <Container as="section" className={cx(styles.band, styles[layout], className)}>
      <IconCircle icon={icon} tone="glass" size={72} iconSize={34} className={styles.icon} />

      <div className={styles.heading}>
        <h2 className={styles.title}>
          {title}{" "}
          {titleAccent && (
            <span className={cx(styles.accent, !accentInline && styles.accentBlock)}>{titleAccent}</span>
          )}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {layout === "split" ? (
        <>
          {aside && <p className={cx(styles.aside, styles.withDivider)}>{aside}</p>}
          {action && <div className={styles.action}>{action}</div>}
        </>
      ) : (
        <>
          {action && <div className={styles.action}>{action}</div>}
          {aside && <p className={cx(styles.aside, styles.withDivider)}>{aside}</p>}
        </>
      )}
    </Container>
  );
}
