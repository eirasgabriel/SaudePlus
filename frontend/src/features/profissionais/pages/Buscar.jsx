import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import Badge from "../../../components/Badge/Badge.jsx";
import Handwriting from "../../../components/Handwriting/Handwriting.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import SearchPanel from "../components/SearchPanel/SearchPanel.jsx";
import FilterSidebar from "../components/FilterSidebar/FilterSidebar.jsx";
import ProfessionalCard from "../components/ProfessionalCard/ProfessionalCard.jsx";
import Container from "../../../components/Container/Container.jsx";
import { UsersIcon, ChevronDownIcon } from "../../../components/icons/Icons.jsx";

import { useBuscaProfissionais, useListasDaBusca } from "../useBuscaProfissionais.js";
import { lerConsultaDaUrl } from "../buscaParametros.js";
import { linkDeAgendamento } from "../perfil.js";
import {
  SEARCH_BENEFITS, CITIES, CARE_TYPES, SPECIALTY_NAMES, SIDEBAR_SPECIALTIES, SORT_OPTIONS,
} from "../data/buscar.js";
import heroArt from "../../../assets/images/hero-buscar.jpg";
import heroMobile from "../../../assets/images/hero-buscar-mobile.jpg";

import styles from "./Buscar.module.css";

const EMPTY_FILTERS = { types: [], specialties: [], insurances: [], allInsurances: false };

export default function Buscar({ onUnavailable }) {
  const [params, setParams] = useSearchParams();

  // Parâmetros vindos de outras páginas (?q=, ?especialidade=, ?cidade=, ?tipo=)
  const initialPanel = lerConsultaDaUrl(params);

  const [panel, setPanel] = useState(initialPanel);
  const [applied, setApplied] = useState(initialPanel);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const { cidades, convenios } = useListasDaBusca();
  const { origem, resultados: results, total, carregando } = useBuscaProfissionais({ applied, filters, sort });

  const clearAll = () => {
    const reset = { term: "", city: CITIES[0], specialty: "", type: "" };
    setPanel(reset);
    setApplied(reset);
    setFilters(EMPTY_FILTERS);
    setSpecialtyQuery("");
    setShowAllSpecialties(false);
    setParams({});
  };

  const countTitle = origem === "carregando"
    ? "Buscando profissionais…"
    : `${total} ${total === 1 ? "profissional" : "profissionais"}`;

  return (
    <>
      <HeroSection
        className={styles.hero}
        stackAt="lg"
        labelledBy="buscar-hero-title"
        contentClassName={styles.heroContent}
        artSrc={heroArt}
        artHeight={370}
        artCropBottom={76}
        artAlt="Mulher sorrindo usando o smartphone"
        mobileSrc={heroMobile}
        overlay={<Handwriting className={styles.handwriting} />}
      >
        <div className={styles.heroText}>
          <Badge>Encontre os melhores profissionais</Badge>
          <HeroTitle id="buscar-hero-title" className={styles.title} lines={["Sua saúde nas"]} accent="melhores mãos" />
          <HeroLead
            className={styles.lead}
            lines={[
              "Busque por especialistas, verifique horários disponíveis",
              "e agende sua consulta de forma rápida, segura e sem complicação.",
            ]}
          />
        </div>

        <ul className={styles.benefits}>
          {SEARCH_BENEFITS.map(({ icon, iconSize, title, description }) => (
            <li key={title} className={styles.benefit}>
              <IconCircle icon={icon} tone="glass" size={50} iconSize={iconSize} />
              <div>
                <p className={styles.benefitTitle}>{title}</p>
                <p className={styles.benefitText}>{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </HeroSection>

      <SearchPanel
        className={styles.panel}
        values={panel}
        onChange={setPanel}
        onSubmit={() => {
          setApplied(panel);
          const next = {};
          if (panel.term.trim()) next.q = panel.term.trim();
          if (panel.specialty) next.especialidade = panel.specialty;
          if (panel.city !== CITIES[0]) next.cidade = panel.city;
          if (panel.type) next.tipo = panel.type;
          setParams(next);
        }}
        cities={cidades.includes(panel.city) ? cidades : [panel.city, ...cidades]}
        specialties={SPECIALTY_NAMES}
        careTypes={CARE_TYPES}
      />

      <Container className={styles.layout}>
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onClear={clearAll}
          careTypes={CARE_TYPES}
          specialties={SIDEBAR_SPECIALTIES}
          allSpecialties={SPECIALTY_NAMES}
          insurances={convenios}
          specialtyQuery={specialtyQuery}
          onSpecialtyQueryChange={setSpecialtyQuery}
          showAllSpecialties={showAllSpecialties}
          onToggleShowAll={() => setShowAllSpecialties((v) => !v)}
        />

        <section className={styles.results} aria-labelledby="results-title">
          {origem === "mocks" ? (
            <p className={styles.demoNotice} role="status">
              Servidor indisponível: mostrando profissionais de demonstração salvos no navegador.
            </p>
          ) : (
            <p className={styles.demoNotice}>
              Para agendar, entre na sua conta: as consultas são marcadas pela área do paciente.
            </p>
          )}
          <header className={styles.resultsHeader}>
            <IconCircle icon={UsersIcon} tone="glass" size={48} iconSize={30} />
            <div className={styles.resultsHeading}>
              <h2 id="results-title" className={styles.resultsTitle} aria-live="polite">{countTitle}</h2>
              <p className={styles.resultsSubtitle}>encontrados para você em {applied.city}</p>
            </div>

            <label htmlFor="sort" className={styles.sortLabel}>Ordenar por:</label>
            <div className={styles.sortSelect}>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDownIcon size={18} />
            </div>
          </header>

          {origem === "carregando" ? null : results.length > 0 ? (
            <div className={styles.list} aria-busy={carregando}>
              {results.map((p) => (
                <ProfessionalCard
                  key={p.id}
                  {...p}
                  onUnavailable={onUnavailable}
                  // Profissionais de demonstração não existem na API: sem perfil nem agendamento.
                  {...(origem === "api" && {
                    perfilHref: `/profissionais/${encodeURIComponent(p.id)}`,
                    agendarHref: (horario) => linkDeAgendamento(p.id, { data: p.slotsDate, horario }),
                  })}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <h3>Nenhum profissional encontrado</h3>
              <p>Ajuste os filtros ou tente outra cidade ou especialidade.</p>
              <button type="button" onClick={clearAll}>Limpar filtros</button>
            </div>
          )}
        </section>
      </Container>
    </>
  );
}
