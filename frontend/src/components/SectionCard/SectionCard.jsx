import Container from "../Container/Container.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./SectionCard.module.css";

/** Card branco grande, na largura do container. */
export default function SectionCard({ as = "section", soft = false, className, children, ...props }) {
  return (
    <Container as={as} className={cx(styles.card, soft && styles.soft, className)} {...props}>
      {children}
    </Container>
  );
}
