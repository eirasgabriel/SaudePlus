import { useMemo, useState } from "react";
import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import Badge from "../../../components/Badge/Badge.jsx";
import SearchBar from "../../../components/SearchBar/SearchBar.jsx";
import ChipList from "../../../components/ChipList/ChipList.jsx";
import FloatingInfoCard from "../../../components/FloatingInfoCard/FloatingInfoCard.jsx";
import Handwriting from "../../../components/Handwriting/Handwriting.jsx";
import SectionCard from "../../../components/SectionCard/SectionCard.jsx";
import Container from "../../../components/Container/Container.jsx";
import { SectionTitle, SectionLink } from "../../../components/SectionTitle/SectionTitle.jsx";
import HelpCard from "../components/HelpCard/HelpCard.jsx";
import FAQAccordion from "../../../components/FAQAccordion/FAQAccordion.jsx";
import ContactPanel from "../components/ContactPanel/ContactPanel.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import Button from "../../../components/Button/Button.jsx";
import { HeadsetIcon, HeartIcon } from "../../../components/icons/Icons.jsx";

import { HELP_SUGGESTIONS, HELP_SHORTCUTS, FAQ, CONTACT_CHANNELS } from "../data/ajuda.js";
import heroArt from "../../../assets/images/hero-ajuda.jpg";
import heroMobile from "../../../assets/images/hero-ajuda-mobile.jpg";

import styles from "./Ajuda.module.css";

const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Ajuda({ onUnavailable }) {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);

  const faqItems = useMemo(() => {
    const term = normalize(query.trim());
    return FAQ.filter((item) => {
      const matchesTopic = !activeTopic || item.tags.includes(activeTopic);
      const matchesTerm = !term || normalize(`${item.question} ${item.answer}`).includes(term);
      return matchesTopic && matchesTerm;
    });
  }, [query, activeTopic]);

  const scrollToFaq = () => {
    setOpenIndex(faqItems.length ? 0 : null);
    document.getElementById("perguntas-frequentes")?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <HeroSection
        className={styles.hero}
        stackAt="lg"
        labelledBy="ajuda-hero-title"
        artSrc={heroArt}
        artHeight={470}
        artCropBottom={70}
        artAlt="Atendente sorridente usando headset"
        mobileSrc={heroMobile}
        mobileAlt="Atendente sorridente usando headset com o aviso Nossa equipe está pronta para ajudar"
        overlay={
          <>
            <FloatingInfoCard
              className={styles.cardTeam}
              icon={HeadsetIcon}
              iconSize={44}
              iconVariant="plain"
              lines={["Nossa equipe", "está pronta para ajudar!"]}
            />
            <Handwriting className={styles.handwriting} />
          </>
        }
      >
        <Badge>Suporte SaúdePlus</Badge>
        <HeroTitle id="ajuda-hero-title" className={styles.title} lines={["Estamos aqui"]} accent="para ajudar você" />
        <HeroLead
          className={styles.lead}
          lines={["Encontre respostas, tire suas dúvidas e conte com", "o nosso time de suporte sempre que precisar."]}
        />
        <SearchBar
          className={styles.search}
          label="Buscar dúvida"
          placeholder="Digite sua dúvida aqui (ex.: como agendar uma consulta?)"
          value={query}
          onChange={(value) => {
            setQuery(value);
            setOpenIndex(null);
          }}
          onSubmit={scrollToFaq}
        />
        <ChipList
          className={styles.chips}
          label="Exemplos de buscas:"
          items={HELP_SUGGESTIONS}
          activeItem={activeTopic}
          onSelect={(topic) => {
            setActiveTopic((current) => (current === topic ? null : topic));
            setOpenIndex(null);
          }}
        />
      </HeroSection>

      {/* Atalhos */}
      <SectionCard className={styles.shortcuts} aria-label="Atalhos de ajuda">
        {HELP_SHORTCUTS.map((item) => (
          <HelpCard key={item.title} {...item} onClick={item.action ? () => onUnavailable(item.title) : undefined} />
        ))}
      </SectionCard>

      <Container className={styles.columns}>
        {/* FAQ */}
        <section id="perguntas-frequentes" className={styles.faq} aria-labelledby="faq-title">
          <header className={styles.faqHeader}>
            <div>
              <SectionTitle id="faq-title" accent="frequentes">Perguntas</SectionTitle>
              <p className={styles.faqSubtitle}>Veja as dúvidas mais comuns dos nossos pacientes.</p>
            </div>
            <SectionLink onClick={() => { setQuery(""); setActiveTopic(null); setOpenIndex(null); }}>Ver todas as perguntas</SectionLink>
          </header>

          {faqItems.length > 0 ? (
            <FAQAccordion className={styles.accordion} items={faqItems} openIndex={openIndex} onToggle={setOpenIndex} />
          ) : (
            <div className={styles.empty}>
              <p>Nenhuma pergunta encontrada para essa busca.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveTopic(null);
                }}
              >
                Limpar busca
              </button>
            </div>
          )}
        </section>

        <ContactPanel
          id="fale-conosco"
          title="Precisa de"
          titleAccent="mais ajuda?"
          description="Fale com o nosso time de suporte e receba atendimento rápido e personalizado."
          channels={CONTACT_CHANNELS}
          onUnavailable={onUnavailable}
        />
      </Container>

      {/* Satisfação */}
      <SectionCard className={styles.satisfaction} aria-labelledby="satisfaction-title">
        <IconCircle icon={HeartIcon} size={68} iconSize={36} />
        <div className={styles.satisfactionCopy}>
          <SectionTitle id="satisfaction-title" accent="nossa prioridade" className={styles.satisfactionTitle}>
            Sua satisfação é a
          </SectionTitle>
          <p>Conte com a gente para ter sempre a melhor experiência na sua jornada de saúde.</p>
        </div>
        <Button onClick={() => onUnavailable("Falar com o suporte")} withArrow className={styles.supportButton}>Falar com o suporte</Button>
      </SectionCard>
    </>
  );
}
