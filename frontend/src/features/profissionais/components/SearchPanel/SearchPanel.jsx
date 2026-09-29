import { SearchIcon, MapPinIcon, StethoscopeIcon, UserIcon, ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import SelectField from "../../../../components/SelectField/SelectField.jsx";
import Container from "../../../../components/Container/Container.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./SearchPanel.module.css";

/** Barra de busca completa: termo, cidade, especialidade, tipo de atendimento. */
export default function SearchPanel({ values, onChange, onSubmit, cities, specialties, careTypes, className }) {
  const set = (key) => (value) => onChange({ ...values, [key]: value });

  return (
    <Container
      as="form"
      role="search"
      className={cx(styles.panel, className)}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className={cx(styles.field, styles.textField)}>
        <SearchIcon size={30} className={styles.searchIcon} />
        <div className={styles.textBody}>
          <label htmlFor="search-term" className={styles.label}>O que você está procurando?</label>
          <input
            id="search-term"
            type="search"
            className={styles.input}
            value={values.term}
            onChange={(e) => set("term")(e.target.value)}
            placeholder="Nome do profissional, especialidade..."
          />
        </div>
      </div>

      <SelectField id="search-city" icon={MapPinIcon} iconSize={28} label="Sua cidade" value={values.city} onChange={set("city")} options={cities} />
      <SelectField
        id="search-specialty"
        icon={StethoscopeIcon}
        iconSize={32}
        label="Especialidade"
        value={values.specialty}
        onChange={set("specialty")}
        options={[{ value: "", label: "Qualquer especialidade" }, ...specialties]}
      />
      <SelectField
        id="search-type"
        icon={UserIcon}
        iconSize={30}
        label="Tipo de atendimento"
        value={values.type}
        onChange={set("type")}
        options={[{ value: "", label: "Qualquer tipo" }, ...careTypes]}
      />

      <button type="submit" className={styles.submit}>
        Buscar
        <ArrowRightIcon size={24} />
      </button>
    </Container>
  );
}
