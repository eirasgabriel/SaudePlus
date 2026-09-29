import { useId } from "react";
import { FilterIcon, RefreshIcon, SearchIcon, ChevronDownIcon } from "../../../../components/icons/Icons.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./FilterSidebar.module.css";

function Checkbox({ label, checked, onChange }) {
  return (
    <label className={styles.checkbox}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.box} aria-hidden="true" />
      {label}
    </label>
  );
}

function FilterGroup({ title, children }) {
  const id = useId();
  return (
    <fieldset className={styles.group} aria-labelledby={id}>
      <legend id={id} className={styles.groupTitle}>{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Filtros da busca. Todas as seleções são controladas pela página:
 * filters = { types: [], specialties: [], insurances: [], allInsurances: bool }
 */
export default function FilterSidebar({
  filters,
  onChange,
  onClear,
  careTypes,
  specialties,
  allSpecialties,
  insurances,
  specialtyQuery,
  onSpecialtyQueryChange,
  showAllSpecialties,
  onToggleShowAll,
  className,
}) {
  const toggle = (key, value) => (checked) => {
    const list = new Set(filters[key]);
    checked ? list.add(value) : list.delete(value);
    onChange({ ...filters, [key]: [...list], ...(key === "insurances" ? { allInsurances: false } : {}) });
  };

  const baseList = showAllSpecialties ? allSpecialties : specialties;
  const term = specialtyQuery.trim().toLowerCase();
  const visibleSpecialties = term ? allSpecialties.filter((s) => s.toLowerCase().includes(term)) : baseList;

  return (
    <aside className={cx(styles.sidebar, className)} aria-labelledby="filters-title">
      <header className={styles.header}>
        <h2 id="filters-title" className={styles.title}>
          <FilterIcon size={26} className={styles.titleIcon} />
          Filtros
        </h2>
        <button type="button" className={styles.clear} onClick={onClear}>
          <RefreshIcon size={16} />
          Limpar filtros
        </button>
      </header>

      <FilterGroup title="Tipo de atendimento">
        {careTypes.map((t) => (
          <Checkbox key={t.value} label={t.label} checked={filters.types.includes(t.value)} onChange={toggle("types", t.value)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Especialidades">
        <div className={styles.search}>
          <SearchIcon size={18} />
          <label className="sr-only" htmlFor="filter-specialty-search">Buscar especialidade</label>
          <input
            id="filter-specialty-search"
            type="search"
            placeholder="Buscar especialidade..."
            value={specialtyQuery}
            onChange={(e) => onSpecialtyQueryChange(e.target.value)}
          />
        </div>
        {visibleSpecialties.map((s) => (
          <Checkbox key={s} label={s} checked={filters.specialties.includes(s)} onChange={toggle("specialties", s)} />
        ))}
        {visibleSpecialties.length === 0 && <p className={styles.none}>Nenhuma especialidade encontrada.</p>}
        {!term && (
          <button type="button" className={styles.more} onClick={onToggleShowAll} aria-expanded={showAllSpecialties}>
            {showAllSpecialties ? "Ver menos especialidades" : "Ver mais especialidades"}
            <ChevronDownIcon size={16} className={cx(styles.moreIcon, showAllSpecialties && styles.moreIconOpen)} />
          </button>
        )}
      </FilterGroup>

      <FilterGroup title="Convênios aceitos">
        <Checkbox
          label="Todos os convênios"
          checked={filters.allInsurances}
          onChange={(checked) => onChange({ ...filters, allInsurances: checked, insurances: [] })}
        />
        {insurances.map((i) => (
          <Checkbox key={i} label={i} checked={filters.insurances.includes(i)} onChange={toggle("insurances", i)} />
        ))}
      </FilterGroup>
    </aside>
  );
}
