import HeroSection, { HeroTitle, HeroLead, HeroAccent } from "../../../components/HeroSection/HeroSection.jsx";
import Badge from "../../../components/Badge/Badge.jsx";
import Button from "../../../components/Button/Button.jsx";
import FloatingInfoCard from "../../../components/FloatingInfoCard/FloatingInfoCard.jsx";
import Handwriting from "../../../components/Handwriting/Handwriting.jsx";
import SectionCard from "../../../components/SectionCard/SectionCard.jsx";
import { SectionTitle } from "../../../components/SectionTitle/SectionTitle.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import InfoCard from "../../../components/InfoCard/InfoCard.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";
import { UsersIcon, HeartIcon, CheckIcon } from "../../../components/icons/Icons.jsx";

import { ABOUT_STATS, PILLARS, TEAM_HIGHLIGHTS } from "../data/sobreNos.js";
import heroArt from "../../../assets/images/hero-sobre-nos.jpg";
import heroMobile from "../../../assets/images/hero-sobre-nos-mobile.jpg";
import teamImg from "../../../assets/images/equipe.jpg";

import styles from "./SobreNos.module.css";

export default function SobreNos({ onUnavailable }) {
  return (
    <>
      <HeroSection
        className={styles.hero}
        stackAt="lg"
        labelledBy="sobre-hero-title"
        artSrc={heroArt}
        artHeight={440}
        artCropBottom={76}
        artAlt="Profissional de saúde sorrindo, de jaleco e estetoscópio"
        mobileSrc={heroMobile}
        mobileAlt="Profissional de saúde sorrindo com o aviso Pessoas mais saudáveis, histórias mais felizes"
        overlay={
          <>
            <FloatingInfoCard
              className={styles.cardPeople}
              icon={UsersIcon}
              iconSize={32}
              iconVariant="soft"
              lines={["Pessoas mais", "saudáveis, histórias", "mais felizes"]}
            />
            <Handwriting className={styles.handwriting} />
          </>
        }
      >
        <Badge>Nossa história</Badge>
        <HeroTitle
          id="sobre-hero-title"
          className={styles.title}
          lines={["Cuidado que conecta", <>pessoas e <HeroAccent>transforma vidas.</HeroAccent></>]}
        />
        <HeroLead
          className={styles.lead}
          lines={[
            "O SaúdePlus nasceu com o propósito de tornar o acesso à saúde",
            "mais simples, humano e acessível. Acreditamos que uma",
            "sociedade mais saudável é construída por pessoas, tecnologia",
            "e cuidado em cada detalhe.",
          ]}
        />
        <div className={styles.actions}>
          <Button variant="hero" href="#nosso-time" withArrow className={styles.primaryCta}>Conheça nossa história</Button>
          <Button variant="ghost" href="#valores" className={styles.secondaryCta}>Nossos valores</Button>
        </div>
      </HeroSection>

      {/* Números */}
      <SectionCard className={styles.stats} aria-label="SaúdePlus em números">
        {ABOUT_STATS.map(({ icon, iconSize, value, label }) => (
          <div key={value} className={styles.stat}>
            <IconCircle icon={icon} size={64} iconSize={iconSize} />
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statLabel}>{label}</p>
          </div>
        ))}
      </SectionCard>

      {/* O que nos move */}
      <SectionCard id="valores" className={styles.pillars} aria-labelledby="pillars-title">
        <header className={styles.cardHeader}>
          <SectionTitle id="pillars-title" accent="move todos os dias">O que nos</SectionTitle>
          <p className={styles.tagline}>Cuidado, inovação e pessoas em primeiro lugar.</p>
        </header>

        <div className={styles.pillarGrid}>
          {PILLARS.map(({ icon, iconSize, title, description, values }) => (
            <InfoCard
              key={title}
              icon={icon}
              iconSize={iconSize}
              circleSize={68}
              title={title}
              description={description}
              className={styles.pillarCard}
            >
              {values && (
                <ul className={styles.values}>
                  {values.map((value) => (
                    <li key={value}>
                      <span className={styles.check}><CheckIcon size={10} /></span>
                      {value}
                    </li>
                  ))}
                </ul>
              )}
            </InfoCard>
          ))}
        </div>
      </SectionCard>

      {/* Nosso time */}
      <SectionCard id="nosso-time" className={styles.team} aria-labelledby="team-title">
        <img className={styles.teamImg} src={teamImg} alt="Equipe de profissionais de saúde do SaúdePlus" loading="lazy" />

        <div className={styles.teamCopy}>
          <span className={styles.lightBadge}>Nosso time</span>
          <h2 id="team-title" className={styles.teamTitle}>
            Grandes pessoas <span>cuidam de grandes histórias</span>
          </h2>
          <p className={styles.teamText}>
            O SaúdePlus é feito por um time apaixonado por saúde, tecnologia e pessoas. São profissionais
            que trabalham todos os dias para facilitar o acesso ao cuidado, com empatia, responsabilidade
            e o compromisso de fazer a diferença na vida de milhares de brasileiros.
          </p>
        </div>

        <ul className={styles.highlights}>
          {TEAM_HIGHLIGHTS.map(({ icon, iconSize, title, description }) => (
            <li key={title} className={styles.highlight}>
              <IconCircle icon={icon} size={60} iconSize={iconSize} />
              <div>
                <h3 className={styles.highlightTitle}>{title}</h3>
                <p className={styles.highlightText}>{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <CTABand
        className={styles.band}
        icon={HeartIcon}
        title="Juntos por uma"
        titleAccent="sociedade mais saudável"
        aside={
          <>
            Acreditamos em um futuro onde todos tenham acesso a um cuidado
            <br />
            de saúde de qualidade. E você faz parte dessa história.
          </>
        }
        action={
          <Button variant="light" onClick={() => onUnavailable("Criar conta")} withArrow className={styles.bandButton}>Faça parte dessa jornada</Button>
        }
      />
    </>
  );
}
