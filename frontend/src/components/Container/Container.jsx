import { cx } from "../../utils/cx.js";
import styles from "./Container.module.css";

/** Container central (1408px no desktop de referência). */
export default function Container({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag className={cx(styles.container, className)} {...props}>
      {children}
    </Tag>
  );
}
