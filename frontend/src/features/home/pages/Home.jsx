import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import Badge from "../../../components/Badge/Badge.jsx";
import Button from "../../../components/Button/Button.jsx";
import FloatingInfoCard from "../../../components/FloatingInfoCard/FloatingInfoCard.jsx";
import Handwriting from "../../../components/Handwriting/Handwriting.jsx";
import SectionCard from "../../../components/SectionCard/SectionCard.jsx";
import FeatureCard from "../../../components/FeatureCard/FeatureCard.jsx";
import StatCard from "../../../components/StatCard/StatCard.jsx";
import { CheckIcon, CalendarIcon } from "../../../components/icons/Icons.jsx";

import { heroContent, benefits, trustContent, stats } from "../data/home.js";
import heroArt from "../../../assets/images/hero-home.jpg";
import heroMobile from "../../../assets/images/hero-home-mobile.jpg";
import doctorImg from "../../../assets/images/medico-home.jpg";

import styles from "./Home.module.css";

export default function Home() {
  return (
    <>
      <HeroSection
        className={styles.hero}
        labelledBy="home-hero-title"
        artSrc={heroArt}
        artCropBottom={100}
        artAlt="Mulher sorrindo enquanto agenda uma consulta pelo smartphone"
        mobileSrc={heroMobile}
        mobileAlt="Mulher sorrindo usando o smartphone, com os avisos Consulta agendada com sucesso e Mais saúde para o seu dia a dia"
        overlay={
          <>
            <FloatingInfoCard
              className={styles.cardScheduled}
              icon={CheckIcon}
              highlight="Consulta agendada"
              lines={["com sucesso!"]}
            />
            <FloatingInfoCard
              className={styles.cardHealth}
              icon={CalendarIcon}
              iconSize={40}
              iconVariant="plain"
              highlight="Mais saúde"
              lines={["para o seu dia a dia"]}
            />
            <Handwriting className={styles.handwriting} />
          </>
        }
      >
        <Badge>{heroContent.badge}</Badge>
        <HeroTitle id="home-hero-title" lines={heroContent.titleLines} accent={heroContent.titleAccent} />
        <HeroLead lines={heroContent.leadLines} />
        <Button variant="hero" to={heroContent.cta.to} withArrow className={styles.heroCta}>
          {heroContent.cta.label}
        </Button>
      </HeroSection>

      {/* Bloco de benefícios sobreposto ao hero */}
      <SectionCard className={styles.benefits} aria-label="Benefícios">
        {benefits.map((item) => (
          <FeatureCard key={item.title} {...item} />
        ))}
      </SectionCard>

      {/* Sua saúde em boas mãos */}
      <SectionCard soft className={styles.trust} aria-labelledby="trust-title">
        <div className={styles.trustMedia}>
          <img src={doctorImg} width="244" height="171" alt="Médico sorridente de jaleco e estetoscópio" loading="lazy" />
        </div>

        <div>
          <h2 id="trust-title" className={styles.trustTitle}>
            {trustContent.title} <span>{trustContent.titleAccent}</span>
          </h2>
          <p className={styles.trustText}>{trustContent.text}</p>
        </div>

        <div className={styles.trustStats}>
          {stats.map((stat) => (
            <StatCard key={stat.value} className={styles.stat} {...stat} />
          ))}
        </div>
      </SectionCard>
    </>
  );
}
