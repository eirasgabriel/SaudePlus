import { useId } from "react";
import { SearchIcon } from "../icons/Icons.jsx";
import Button from "../Button/Button.jsx";
import { cx } from "../../utils/cx.js";
import styles from "./SearchBar.module.css";

/** Campo de busca branco com botão "Buscar" (usado nos heróis). */
export default function SearchBar({ value, onChange, onSubmit, placeholder, label, buttonLabel = "Buscar", className }) {
  const inputId = useId();
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form role="search" className={cx(styles.bar, className)} onSubmit={handleSubmit}>
      <SearchIcon size={26} className={styles.icon} />
      <label className="sr-only" htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={styles.input}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <Button type="submit" className={styles.button}>{buttonLabel}</Button>
    </form>
  );
}
