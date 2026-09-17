import { Fragment } from "react";
import HeroSection, { HeroTitle, HeroLead, HeroAccent } from "../../../components/HeroSection/HeroSection.jsx";
import Badge from "../../../components/Badge/Badge.jsx";
import Button from "../../../components/Button/Button.jsx";
import FloatingInfoCard from "../../../components/FloatingInfoCard/FloatingInfoCard.jsx";
import Handwriting from "../../../components/Handwriting/Handwriting.jsx";
import SectionCard from "../../../components/SectionCard/SectionCard.jsx";
import { SectionTitle } from "../../../components/SectionTitle/SectionTitle.jsx";
import StepCard from "../../../components/StepCard/StepCard.jsx";
import InfoCard from "../../../components/InfoCard/InfoCard.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";
import { ClockIcon, ShieldCheckIcon, HeartIcon, ArrowRightIcon } from "../../../components/icons/Icons.jsx";

import { STEPS, REASONS } from "../data/comoFunciona.js";
import heroArt from "../../../assets/images/hero-como-funciona.jpg";
import heroMobile from "../../../assets/images/hero-como-funciona-mobile.jpg";

import styles from "./ComoFunciona.module.css";

export default function ComoFunciona({ onUnavailable }) {
  return (
    <>
      <HeroSection
        className={styles.hero}
        stackAt="lg"
        labelledBy="como-hero-title"
        artSrc={heroArt}
        artHeight={512}
        artCropBottom={84}
        artAlt="Mulher sorrindo usando o smartphone"
        mobileSrc={heroMobile}
        mobileAlt="Mulher usando o smartphone com os avisos Agendamento em poucos cliques e Processo seguro e confiável"
        overlay={
          <>
            <FloatingInfoCard
              className={styles.cardSchedule}
              icon={ClockIcon}
              iconSize={44}
              iconVariant="plain"
              lines={["Agendamento", "em poucos cliques"]}
            />
            <FloatingInfoCard
              className={styles.cardSafe}
              icon={ShieldCheckIcon}
              iconSize={42}
              iconVariant="plain"
              lines={["Processo seguro", "e confiável"]}
            />
            <Handwriting className={styles.handwriting} />
          </>
        }
      >
        <Badge>Processo simples e seguro</Badge>
        <HeroTitle
          id="como-hero-title"
          className={styles.title}
          lines={["Cuidar da sua saúde", <>ficou <HeroAccent>mais simples</HeroAccent></>]}
        />
        <HeroLead
          className={styles.lead}
          lines={[
            "Em poucos passos você encontra o especialista ideal,",
            "agenda sua consulta e cuida da sua saúde com",
            "praticidade e segurança.",
          ]}
        />
        <div className={styles.actions}>
          <Button variant="hero" onClick={() => onUnavailable("Criar conta")} withArrow className={styles.primaryCta}>Criar conta agora</Button>
          <Button variant="ghost" to="/especialidades" className={styles.secondaryCta}>Ver especialidades</Button>
        </div>
      </HeroSection>

      {/* Etapas */}
      <SectionCard className={styles.steps} aria-labelledby="steps-title">
        <SectionTitle id="steps-title" accent="SaúdePlus">Veja como é fácil usar o</SectionTitle>
        <ol className={styles.stepList}>
          {STEPS.map((step, i) => (
            <Fragment key={step.title}>
              {i > 0 && (
                <li className={styles.arrow} aria-hidden="true">
                  <ArrowRightIcon size={22} />
                </li>
              )}
              <StepCard number={i + 1} {...step} />
            </Fragment>
          ))}
        </ol>
      </SectionCard>

      {/* Por que escolher */}
      <SectionCard className={styles.reasons} aria-labelledby="reasons-title">
        <SectionTitle id="reasons-title" accent="SaúdePlus?">Por que escolher o</SectionTitle>
        <div className={styles.reasonGrid}>
          {REASONS.map((reason) => (
            <InfoCard key={reason.title} {...reason} className={styles.reasonCard} />
          ))}
        </div>
      </SectionCard>

      <CTABand
        className={styles.band}
        layout="stacked"
        accentInline
        icon={HeartIcon}
        title="Sua saúde em"
        titleAccent="boas mãos"
        subtitle="Comece agora e descubra como é simples ter um cuidado de qualidade."
        action={
          <Button variant="light" onClick={() => onUnavailable("Criar conta")} withArrow className={styles.bandButton}>Criar conta agora</Button>
        }
        aside={<>É rápido, gratuito<br />e seguro.</>}
      />
    </>
  );
}
