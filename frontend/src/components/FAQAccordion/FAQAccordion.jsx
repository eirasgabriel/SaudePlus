import { useId, useState } from "react";
import { ChevronDownIcon } from "../icons/Icons.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./FAQAccordion.module.css";

/** Lista de perguntas em accordion (um item aberto por vez). */
export default function FAQAccordion({ items, openIndex: controlledIndex, onToggle, className }) {
  const [internalIndex, setInternalIndex] = useState(null);
  const baseId = useId();
  const openIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const toggle = (index) => {
    const next = openIndex === index ? null : index;
    if (onToggle) onToggle(next);
    else setInternalIndex(next);
  };

  return (
    <ul className={cx(styles.list, className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <li key={item.question} className={cx(styles.item, isOpen && styles.open)}>
            <h3 className={styles.heading}>
              <button
                id={buttonId}
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                {item.question}
                <ChevronDownIcon size={22} className={styles.chevron} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel} hidden={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
