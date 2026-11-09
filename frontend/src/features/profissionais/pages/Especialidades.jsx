import { Link } from "react-router-dom";

import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import Container from "../../../components/Container/Container.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import { SectionLink } from "../../../components/SectionTitle/SectionTitle.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";
import DoctorCard from "../components/DoctorCard/DoctorCard.jsx";
import Button from "../../../components/Button/Button.jsx";
import { CalendarLineIcon } from "../../../components/icons/Icons.jsx";

import { SPECIALTIES, POPULAR_SPECIALTIES } from "../data/specialties.js";
import { useDestaques } from "../useBuscaProfissionais.js";
import heroArt from "../../../assets/images/hero-especialidades-rente.jpg";
import heroMobile from "../../../assets/images/hero-especialidades-mobile.jpg";

import styles from "./Especialidades.module.css";

const buscaPor = (nome) => `/buscar?especialidade=${encodeURIComponent(nome)}`;

export default function Especialidades() {
  const destaques = useDestaques();

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
        mobileAlt="Médica sorridente de jaleco e estetoscópio"
        rente
        cruz={{ x: 1050, y: 75, tamanho: 200 }}
      >
        <HeroTitle id="esp-hero-title" lines={["Explore nossas"]} accent="especialidades" />
        <HeroLead
          lines={[
            "Encontre a especialidade ideal, conheça nossos profissionais",
            "e agende sua consulta de forma simples, segura e rápida.",
          ]}
        />
      </HeroSection>

      {/* Buscas populares: atalhos para a busca já filtrada */}
      <Container as="nav" className={styles.popular} aria-label="Buscas populares">
        <span className={styles.popularLabel}>Buscas populares:</span>
        <ul className={styles.popularList}>
          {POPULAR_SPECIALTIES.map((nome) => (
            <li key={nome}>
              <Link to={buscaPor(nome)} className={styles.chip}>{nome}</Link>
            </li>
          ))}
        </ul>
      </Container>

      {/* Todas as especialidades */}
      <Container as="section" className={styles.explore} aria-labelledby="explore-title">
        <h2 id="explore-title" className="sr-only">Todas as especialidades</h2>
        <ul className={styles.specialtyGrid}>
          {SPECIALTIES.map((s) => (
            <li key={s.slug}>
              <Link to={buscaPor(s.name)} className={styles.specialty}>
                <IconCircle icon={s.icon} size={64} iconSize={s.iconSize} className={styles.specialtyIcon} />
                <span>
                  <span className={styles.specialtyName}>{s.name}</span>
                  <span className={styles.specialtyText}>{s.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <CTABand
        className={styles.band}
        icon={CalendarLineIcon}
        title={<>Agende sua consulta na <span className={styles.bandAccent}>especialidade</span> que você precisa</>}
        subtitle="Atendimento com profissionais qualificados, em uma plataforma segura e confiável."
        action={
          <Button variant="light" to="/buscar" icon={CalendarLineIcon} withArrow className={styles.bandButton}>
            Agendar consulta
          </Button>
        }
      />

      {/* Profissionais em destaque: só com dados da API (sem demonstração). */}
      {destaques.length > 0 && (
        <Container as="section" className={styles.featured} aria-labelledby="featured-title">
          <header className={styles.cardHeader}>
            <h2 id="featured-title" className={styles.cardTitle}>
              Profissionais <span>em destaque</span>
            </h2>
            <SectionLink to="/buscar">Ver todos os profissionais</SectionLink>
          </header>

          <div className={styles.doctorGrid}>
            {destaques.map((p) => (
              <DoctorCard key={p.id} {...p} />
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
