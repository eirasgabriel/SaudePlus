import { Link } from "react-router-dom";
import HeroSection, { HeroTitle, HeroLead, HeroAccent, HeroActions } from "../../../components/HeroSection/HeroSection.jsx";
import Button from "../../../components/Button/Button.jsx";
import Container from "../../../components/Container/Container.jsx";
import { FaixaDestaques } from "../../../components/Vitrine/Vitrine.jsx";
import { SectionLink } from "../../../components/SectionTitle/SectionTitle.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import { CalendarLineIcon, PlayCircleLineIcon } from "../../../components/icons/Icons.jsx";

import { useBuscasPopulares } from "../../profissionais/useBuscasPopulares.js";
import { heroContent, benefits, featuredSpecialties } from "../data/home.js";
import { BENEFICIOS_PLATAFORMA } from "../../institucional/data/sobreNos.js";
import heroArt from "../../../assets/images/hero-home-rente.jpg";
import heroMobile from "../../../assets/images/hero-home-mobile.jpg";

import styles from "./Home.module.css";

const buscaPor = (nome) => `/buscar?especialidade=${encodeURIComponent(nome)}`;

export default function Home() {
  const { buscas: buscasPopulares } = useBuscasPopulares(6);

  return (
    <>
      <HeroSection
        className={styles.hero}
        labelledBy="home-hero-title"
        artSrc={heroArt}
        artCropBottom={235}
        artAlt="Mulher sorrindo enquanto agenda uma consulta pelo smartphone"
        mobileSrc={heroMobile}
        mobileAlt="Mulher sorrindo usando o smartphone"
        rente
        cruz={{ x: 960, y: 70, tamanho: 280 }}
      >
        <HeroTitle
          id="home-hero-title"
          lines={["Sua saúde em boas mãos", <>com o <HeroAccent>SaúdePlus</HeroAccent></>]}
        />
        <HeroLead lines={[heroContent.lead]} />
        <HeroActions>
          <Button variant="hero" to={heroContent.agendar.to} icon={CalendarLineIcon} withArrow>
            {heroContent.agendar.label}
          </Button>
          <Button variant="ghost" to={heroContent.conhecer.to} icon={PlayCircleLineIcon} className={styles.ghost}>
            {heroContent.conhecer.label}
          </Button>
        </HeroActions>
      </HeroSection>

      <FaixaDestaques itens={benefits} rotulo="Por que agendar pelo SaúdePlus" />

      <FaixaDestaques itens={BENEFICIOS_PLATAFORMA} titulo="Benefícios da" destaque="plataforma" sobreposta={false} />

      {/* Atalhos por especialidade: o caminho mais curto até a busca filtrada */}
      <Container as="section" className={styles.specialties} aria-labelledby="specialties-title">
        <header className={styles.cardHeader}>
          <h2 id="specialties-title" className={styles.cardTitle}>
            Explore nossas <span>especialidades</span>
          </h2>
          <SectionLink to="/especialidades">Ver todas as especialidades</SectionLink>
        </header>

        <nav className={styles.chips} aria-label="Buscar por especialidade">
          <Link to="/especialidades" className={`${styles.chip} ${styles.chipAtivo}`}>Todas</Link>
          {featuredSpecialties.map((s) => (
            <Link key={s.slug} to={buscaPor(s.name)} className={styles.chip}>{s.name}</Link>
          ))}
        </nav>

        {buscasPopulares.length > 0 && (
          <nav className={styles.populares} aria-labelledby="buscas-populares-titulo">
            <h3 id="buscas-populares-titulo" className={styles.popularesRotulo}>Buscas populares</h3>
            <ul className={styles.popularesLista}>
              {buscasPopulares.map((b) => (
                <li key={b.slug}>
                  <Link to={buscaPor(b.nome)} className={styles.popularesItem}>{b.nome}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <ul className={styles.specialtyGrid}>
          {featuredSpecialties.map((s) => (
            <li key={s.slug}>
              <Link to={buscaPor(s.name)} className={styles.specialty}>
                <IconCircle icon={s.icon} size={58} iconSize={s.iconSize} className={styles.specialtyIcon} />
                <span>
                  <span className={styles.specialtyName}>{s.name}</span>
                  <span className={styles.specialtyText}>{s.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

    </>
  );
}
