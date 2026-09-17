import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./SectionTitle.module.css";

/** Título de seção com trecho destacado em azul (`accent`). */
export function SectionTitle({ as: Tag = "h2", id, children, accent, after, className }) {
  return (
    <Tag id={id} className={cx(styles.title, className)}>
      {children}
      {accent && <> <span className={styles.accent}>{accent}</span></>}
      {after}
    </Tag>
  );
}

/** Link "Ver todas…" com seta, usado no canto dos cards. */
export function SectionLink({ to, children, className, onClick }) {
  const Tag = to ? Link : "button";
  return (
    <Tag to={to} type={to ? undefined : "button"} onClick={onClick} className={cx(styles.link, className)}>
      {children}
      <ArrowRightIcon size={20} />
    </Tag>
  );
}
