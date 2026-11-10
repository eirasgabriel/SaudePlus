import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import Button from "../../../components/Button/Button.jsx";
import Container from "../../../components/Container/Container.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import { TituloCentral, GradeCartoes } from "../../../components/Vitrine/Vitrine.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";

import { STEPS, REASONS } from "../data/comoFunciona.js";
import heroArt from "../../../assets/images/hero-como-funciona-rente.jpg";
import heroMobile from "../../../assets/images/hero-como-funciona-mobile.jpg";

import styles from "./ComoFunciona.module.css";

export default function ComoFunciona() {
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
        mobileAlt="Mulher sorrindo usando o smartphone"
        rente
        cruz={{ x: 1020, y: 80, tamanho: 210 }}
      >
        <HeroTitle id="como-hero-title" lines={["Veja como é fácil usar o"]} accent="SaúdePlus" />
        <HeroLead
          lines={[
            "Do cadastro ao atendimento, um processo simples, rápido",
            "e seguro para cuidar da sua saúde, do seu jeito.",
          ]}
        />
      </HeroSection>

      {/* Etapas: sequência real, por isso numerada */}
      <Container as="section" className={styles.steps} aria-labelledby="steps-title">
        <h2 id="steps-title" className="sr-only">Etapas para usar o SaúdePlus</h2>
        <ol className={styles.stepList}>
          {STEPS.map(({ icone, titulo, descricao }, i) => (
            <li key={titulo} className={styles.step}>
              <span className={styles.number} aria-hidden="true">{i + 1}</span>
              <IconCircle icon={icone} size={72} iconSize={40} className={styles.stepIcon} />
              <h3 className={styles.stepTitle}>
                <span className="sr-only">Etapa {i + 1}: </span>
                {titulo}
              </h3>
              <p className={styles.stepText}>{descricao}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* Por que escolher */}
      <Container as="section" className={styles.reasons} aria-labelledby="reasons-title">
        <TituloCentral id="reasons-title" destaque="SaúdePlus?">Por que escolher o</TituloCentral>
        <GradeCartoes itens={REASONS} />
      </Container>

      <CTABand
        className={styles.band}
        title="Sua saúde em boas mãos"
        subtitle="Crie sua conta gratuitamente e comece a cuidar da sua saúde hoje mesmo."
        action={
          <Button variant="light" to="/cadastro" withArrow className={styles.bandButton}>
            Criar conta agora
          </Button>
        }
      />
    </>
  );
}
