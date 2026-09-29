import { useState } from "react";
import { useNavigate } from "react-router-dom";

import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import SearchBar from "../../../components/SearchBar/SearchBar.jsx";
import ChipList from "../../../components/ChipList/ChipList.jsx";
import FloatingInfoCard from "../../../components/FloatingInfoCard/FloatingInfoCard.jsx";
import Handwriting from "../../../components/Handwriting/Handwriting.jsx";
import SectionCard from "../../../components/SectionCard/SectionCard.jsx";
import { SectionTitle, SectionLink } from "../../../components/SectionTitle/SectionTitle.jsx";
import SpecialtyCard from "../components/SpecialtyCard/SpecialtyCard.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";
import DoctorCard from "../components/DoctorCard/DoctorCard.jsx";
import Button from "../../../components/Button/Button.jsx";
import { UsersIcon, ShieldCheckIcon, StarIcon } from "../../../components/icons/Icons.jsx";

import { SPECIALTIES, POPULAR_SPECIALTIES } from "../data/specialties.js";
import { useDestaques } from "../useBuscaProfissionais.js";
import heroArt from "../../../assets/images/hero-especialidades.jpg";
import heroMobile from "../../../assets/images/hero-especialidades-mobile.jpg";

import styles from "./Especialidades.module.css";

const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Especialidades() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const destaques = useDestaques();

  const filtered = query.trim()
    ? SPECIALTIES.filter((s) => normalize(`${s.name} ${s.description}`).includes(normalize(query.trim())))
    : SPECIALTIES;

  const goToSearch = (term) => {
    const q = term.trim();
    navigate(q ? `/buscar?especialidade=${encodeURIComponent(q)}` : "/buscar");
  };

  return (
    <>
      <HeroSection
        className={styles.hero}
        stackAt="lg"
        labelledBy="esp-hero-title"
        artSrc={heroArt}
        artHeight={480}
        artCropBottom={88}
        artAlt="Médica sorridente de jaleco e estetoscópio"
        mobileSrc={heroMobile}
        mobileAlt="Médica sorridente com os avisos Profissionais especializados e verificados e Mais segurança para a sua escolha"
        overlay={
          <>
            <FloatingInfoCard
              className={styles.cardVerified}
              icon={UsersIcon}
              iconSize={36}
              iconVariant="soft"
              lines={["Profissionais", "especializados", "e verificados"]}
            />
            <FloatingInfoCard
              className={styles.cardSafety}
              icon={ShieldCheckIcon}
              iconSize={42}
              iconVariant="plain"
              lines={["Mais segurança", "para a sua escolha"]}
            />
            <Handwriting className={styles.handwriting} />
          </>
        }
      >
        <HeroTitle
          id="esp-hero-title"
          className={styles.title}
          lines={["Encontre a", "especialidade ideal"]}
          accent="para você"
        />
        <HeroLead
          className={styles.lead}
          lines={[
            "Descubra especialistas qualificados na área que você precisa,",
            "de forma rápida, segura e sem complicação.",
          ]}
        />
        <SearchBar
          className={styles.search}
          label="Buscar especialidade"
          placeholder="Qual especialidade você está procurando?"
          value={query}
          onChange={setQuery}
          onSubmit={goToSearch}
        />
        <ChipList
          className={styles.chips}
          label="Buscas mais populares:"
          items={POPULAR_SPECIALTIES}
          activeItem={query}
          onSelect={(item) => setQuery((current) => (current === item ? "" : item))}
        />
      </HeroSection>

      {/* Explore nossas especialidades */}
      <SectionCard className={styles.explore} aria-labelledby="explore-title">
        <header className={styles.cardHeader}>
          <SectionTitle id="explore-title" accent="especialidades">Explore nossas</SectionTitle>
          <SectionLink onClick={() => setQuery("")}>Ver todas as especialidades</SectionLink>
        </header>

        {filtered.length > 0 ? (
          <div className={styles.specialtyGrid}>
            {filtered.map((s) => (
              <SpecialtyCard key={s.slug} {...s} to={`/buscar?especialidade=${encodeURIComponent(s.name)}`} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            Nenhuma especialidade encontrada para “{query}”. Tente outro termo ou{" "}
            <button type="button" onClick={() => setQuery("")}>veja todas as especialidades</button>.
          </p>
        )}
      </SectionCard>

      <CTABand
        className={styles.band}
        icon={StarIcon}
        title="Cuidado especializado"
        titleAccent="para uma vida melhor"
        aside={
          <>
            Conte com profissionais experientes e altamente
            <br />
            qualificados em diversas especialidades médicas.
          </>
        }
        action={
          <Button variant="light" to="/buscar" withArrow className={styles.bandButton}>
            Agendar consulta
          </Button>
        }
      />

      {/* Profissionais em destaque */}
      <SectionCard className={styles.featured} aria-labelledby="featured-title">
        <header className={styles.cardHeader}>
          <div>
            <SectionTitle id="featured-title" className={styles.featuredTitle}>Profissionais em destaque</SectionTitle>
            <p className={styles.subtitle}>Encontre especialistas de confiança nas principais especialidades.</p>
          </div>
          <SectionLink to="/buscar">Ver todos os profissionais</SectionLink>
        </header>

        <div className={styles.doctorGrid}>
          {destaques.map((p) => (
            <DoctorCard key={p.id} {...p} />
          ))}
        </div>
      </SectionCard>
    </>
  );
}
