import { useState } from "react";
import { Link } from "react-router-dom";
import HeroSection, { HeroTitle, HeroLead } from "../../../components/HeroSection/HeroSection.jsx";
import Container from "../../../components/Container/Container.jsx";
import IconCircle from "../../../components/IconCircle/IconCircle.jsx";
import FAQAccordion from "../../../components/FAQAccordion/FAQAccordion.jsx";
import CTABand from "../../../components/CTABand/CTABand.jsx";
import Button from "../../../components/Button/Button.jsx";
import {
  ArrowRightIcon, ChevronRightIcon, HeadsetLineIcon, HeartIcon, QuestionCircleIcon,
} from "../../../components/icons/Icons.jsx";

import { HELP_SHORTCUTS, FAQ, CONTACT_CHANNELS } from "../data/ajuda.js";
import { useChatOnline } from "../../../components/ChatFlutuante/chatOnline.js";
import heroArt from "../../../assets/images/hero-ajuda-rente.jpg";
import heroMobile from "../../../assets/images/hero-ajuda-mobile.jpg";

import styles from "./Ajuda.module.css";

/* Conteúdo de um cartão de atalho: ícone em círculo, texto e seta. */
function ConteudoAtalho({ icone: Icone, titulo, descricao }) {
  return (
    <>
      <span className={styles.shortcutIcon}><Icone size={30} /></span>
      <span className={styles.shortcutBody}>
        <span className={styles.shortcutTitle}>{titulo}</span>
        <span className={styles.shortcutText}>{descricao}</span>
      </span>
      <ChevronRightIcon size={22} className={styles.shortcutChevron} />
    </>
  );
}

export default function Ajuda({ onUnavailable }) {
  const [openIndex, setOpenIndex] = useState(null);
  const chatOnline = useChatOnline();

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
        mobileAlt="Atendente sorridente usando headset"
        rente
        cruz={{ x: 1050, y: 75, tamanho: 195 }}
      >
        <HeroTitle id="ajuda-hero-title" lines={["Ajuda e Suporte do"]} accent="SaúdePlus" />
        <HeroLead
          lines={["Tire suas dúvidas, encontre orientações e receba", "suporte sempre que precisar."]}
        />
      </HeroSection>

      {/* Atalhos: cartões azuis sobre a base do hero */}
      <Container as="nav" className={styles.shortcuts} aria-label="Atalhos de ajuda">
        <ul className={styles.shortcutList}>
          {HELP_SHORTCUTS.map(({ acao, para, href, ...item }) => (
            <li key={item.titulo}>
              {para ? (
                <Link to={para} className={styles.shortcut}><ConteudoAtalho {...item} /></Link>
              ) : href ? (
                <a href={href} className={styles.shortcut}><ConteudoAtalho {...item} /></a>
              ) : (
                <button type="button" className={styles.shortcut} onClick={() => onUnavailable(acao)}>
                  <ConteudoAtalho {...item} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Container>

      <Container className={styles.columns}>
        {/* Perguntas frequentes */}
        <section id="perguntas-frequentes" className={styles.faq} aria-labelledby="faq-title">
          <header className={styles.faqHeader}>
            <IconCircle icon={QuestionCircleIcon} size={60} iconSize={32} className={styles.faqIcon} />
            <div>
              <h2 id="faq-title" className={styles.faqTitle}>
                Perguntas <span>frequentes</span>
              </h2>
              <p className={styles.faqSubtitle}>Veja as dúvidas mais comuns dos nossos pacientes.</p>
            </div>
          </header>
          <FAQAccordion items={FAQ} openIndex={openIndex} onToggle={setOpenIndex} className={styles.faqList} />
        </section>

        {/* Canais de atendimento */}
        <section id="fale-conosco" className={styles.contact} aria-labelledby="contact-title">
          <HeadsetLineIcon size={150} className={styles.contactArt} />

          <div className={styles.contactHeader}>
            <span className={styles.contactIcon}><HeadsetLineIcon size={30} /></span>
            <h2 id="contact-title" className={styles.contactTitle}>
              Precisa de <span>mais ajuda?</span>
            </h2>
          </div>
          <p className={styles.contactText}>
            Fale com o nosso time de suporte e receba atendimento rápido e personalizado.
          </p>

          <ul className={styles.channels}>
            {CONTACT_CHANNELS.map(({ icone, titulo, descricao, status, chat }) => (
              <li key={titulo}>
                <button
                  type="button"
                  className={styles.channel}
                  aria-haspopup={chat && chatOnline ? "dialog" : undefined}
                  onClick={() => (chat && chatOnline ? chatOnline.abrir() : onUnavailable(titulo))}
                >
                  <IconCircle icon={icone} size={52} iconSize={28} className={styles.channelIcon} />
                  <span className={styles.channelBody}>
                    <span className={styles.channelTitle}>{titulo}</span>
                    <span className={styles.channelText}>{descricao}</span>
                  </span>
                  {status && <span className={styles.status}>{status}</span>}
                  <ArrowRightIcon size={20} className={styles.channelArrow} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      <CTABand
        className={styles.band}
        icon={HeartIcon}
        iconTone="dark"
        cross={false}
        title="Sua satisfação é a"
        titleAccent="nossa prioridade"
        accentBlock
        aside="Conte com a gente para ter sempre a melhor experiência na sua jornada de saúde."
        action={
          <Button variant="light" withArrow onClick={() => onUnavailable("Falar com o suporte")} className={styles.bandButton}>
            Falar com o suporte
          </Button>
        }
      />
    </>
  );
}
