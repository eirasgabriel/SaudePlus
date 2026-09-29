import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./Button.module.css";

/**
 * Botão do sistema.
 * variant: "primary" | "outline" | "hero"
 * - `to`   → <Link> (rota interna)
 * - `href` → <a>
 * - senão  → <button>
 */
export default function Button({
  variant = "primary",
  to,
  href,
  withArrow = false,
  className,
  children,
  ...props
}) {
  const classes = cx(styles.btn, styles[variant], className);
  const content = (
    <>
      {children}
      {withArrow && <ArrowRightIcon className={styles.arrow} />}
    </>
  );

  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...props}>{content}</a>;
  return <button type="button" className={classes} {...props}>{content}</button>;
}
