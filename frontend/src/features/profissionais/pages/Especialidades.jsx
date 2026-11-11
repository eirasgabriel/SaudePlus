import { Link } from "react-router-dom";

import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import Container from "../../../components/Container/Container.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import { SectionLink } from "../../../components/SectionTitle/SectionTitle.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";
import DoctorCard, { DoctorCardVazio } from "../components/DoctorCard/DoctorCard.jsx";
import Button from "../../../components/Button/Button.jsx";
import { CalendarLineIcon } from "../../../components/icons/Icons.jsx";

import { SPECIALTIES } from "../data/specialties.js";
import { useBuscasPopulares } from "../useBuscasPopulares.js";
import { useDestaques } from "../useBuscaProfissionais.js";
import heroArt from "../../../assets/images/hero-especialidades-rente.jpg";
import heroMobile from "../../../assets/images/hero-especialidades-mobile.jpg";

import styles from "./Especialidades.module.css";

const VAGAS_EM_DESTAQUE = 4;

const buscaPor = (nome) => `/buscar?especialidade=${encodeURIComponent(nome)}`;

export default function Especialidades() {
  const destaques = useDestaques(VAGAS_EM_DESTAQUE);
  const { buscas: buscasPopulares } = useBuscasPopulares(10);

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

      {/* Buscas populares: o cartão fica sempre; os botões são o top 10 das
          especialidades mais buscadas em 30 dias (API). Sem dados, fica em branco. */}
      <Container as="nav" className={styles.popular} aria-label="Buscas populares">
        <span className={styles.popularLabel}>Buscas populares:</span>
        {buscasPopulares.length > 0 ? (
          <ul className={styles.popularList}>
            {buscasPopulares.map((b) => (
              <li key={b.slug}>
                <Link to={buscaPor(b.nome)} className={styles.chip}>{b.nome}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <span className={styles.popularVazio} />
        )}
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

      {/* Profissionais em destaque: VAGAS_EM_DESTAQUE cartões fixos. Cada vaga
          mostra um médico do ranking (perfis mais abertos em 30 dias) ou fica
          em branco; o ranking é buscado de novo conforme muda. */}
      <Container as="section" className={styles.featured} aria-labelledby="featured-title">
        <header className={styles.cardHeader}>
          <h2 id="featured-title" className={styles.cardTitle}>
            Profissionais <span>em destaque</span>
          </h2>
          <SectionLink to="/buscar">Ver todos os profissionais</SectionLink>
        </header>

        <div className={styles.doctorGrid}>
          {Array.from({ length: VAGAS_EM_DESTAQUE }, (_, i) => {
            const p = destaques[i];
            return p ? <DoctorCard key={p.id} {...p} /> : <DoctorCardVazio key={`vaga-${i}`} />;
          })}
        </div>
      </Container>
    </>
  );
}
