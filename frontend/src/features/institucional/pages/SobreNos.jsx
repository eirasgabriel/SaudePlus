import HeroSection, { HeroTitle, HeroLead, HeroAccent } from "../../../components/HeroSection/HeroSection.jsx";
import Button from "../../../components/Button/Button.jsx";
import Container from "../../../components/Container/Container.jsx";
import { FaixaDestaques, TituloCentral, GradeCartoes, CartaoIcone } from "../../../components/Vitrine/Vitrine.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";

import { BENEFICIOS_PLATAFORMA, PILARES, DESTAQUES_EQUIPE } from "../data/sobreNos.js";
import heroArt from "../../../assets/images/hero-sobre-nos-rente.jpg";
import heroMobile from "../../../assets/images/hero-sobre-nos-mobile.jpg";
import teamImg from "../../../assets/images/equipe.jpg";

import styles from "./SobreNos.module.css";

export default function SobreNos() {
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
        mobileAlt="Profissional de saúde sorrindo, de jaleco e estetoscópio"
        rente
        cruz={{ x: 1010, y: 68, tamanho: 180 }}
      >
        <HeroTitle id="sobre-hero-title" lines={[<>Conheça o <HeroAccent>SaúdePlus</HeroAccent></>]} />
        <HeroLead
          lines={[
            "Tecnologia, cuidado e pessoas para tornar a sua jornada",
            "de saúde mais simples, segura e humanizada.",
          ]}
        />
      </HeroSection>

      <FaixaDestaques itens={BENEFICIOS_PLATAFORMA} titulo="Benefícios da" destaque="plataforma" />

      <Container as="section" id="valores" className={styles.section} aria-labelledby="pilares-title">
        <TituloCentral id="pilares-title" destaque="todos os dias">O que nos move</TituloCentral>
        <GradeCartoes itens={PILARES} />
      </Container>

      {/* Nosso time */}
      <Container as="section" id="nosso-time" className={styles.team} aria-labelledby="team-title">
        <img
          className={styles.teamImg}
          src={teamImg}
          width="520"
          height="290"
          alt="Equipe de profissionais de saúde sorrindo, de jaleco e uniforme"
          loading="lazy"
        />

        <div className={styles.teamText}>
          <h2 id="team-title" className={styles.teamTitle}>
            Grandes pessoas cuidam de grandes <span>histórias</span>
          </h2>
          <p>
            O SaúdePlus é um ecossistema de saúde digital criado por profissionais que acreditam no poder da
            tecnologia para conectar, facilitar e humanizar o cuidado. Nossa história é feita por uma equipe
            multidisciplinar, apaixonada por saúde e focada em gerar impacto real na vida das pessoas.
          </p>
        </div>

        <ul className={styles.highlights}>
          {DESTAQUES_EQUIPE.map((item) => (
            <li key={item.titulo}>
              <CartaoIcone as="div" {...item} className={styles.highlight} />
            </li>
          ))}
        </ul>
      </Container>

      <CTABand
        className={styles.band}
        title="Juntos por uma sociedade"
        titleAccent="mais saudável"
        subtitle="Tecnologia, confiança e cuidado para transformar o acesso à saúde no Brasil."
        action={
          <Button variant="light" to="/como-funciona" withArrow className={styles.bandButton}>
            Conheça a plataforma
          </Button>
        }
      />
    </>
  );
}
