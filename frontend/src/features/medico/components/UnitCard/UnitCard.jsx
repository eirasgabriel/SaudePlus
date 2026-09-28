import { MapPinIcon, PhoneIcon, ClockIcon, ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./UnitCard.module.css";

/** "(22) 2655-1234" -> "tel:+552226551234" */
const paraLinkTelefone = (telefone) => `tel:+55${telefone.replace(/\D/g, "")}`;

/**
 * Monta o link do mapa.
 *
 * Se a unidade já tiver um `mapUrl` de verdade, ele manda. Caso contrário
 * (hoje o mock traz "#"), montamos a busca do Google Maps pelo endereço —
 * é um destino externo real, então não precisa esperar tela nenhuma.
 *
 * Quando o back-end passar a guardar coordenadas, troque por
 * `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.
 */
function linkDoMapa({ mapUrl, nome, endereco }) {
  if (mapUrl && mapUrl !== "#") return mapUrl;
  const busca = encodeURIComponent(`${nome} ${endereco}`);
  return `https://www.google.com/maps/search/?api=1&query=${busca}`;
}

/** Dados da unidade onde o médico atende. */
export default function UnitCard({ unidade }) {
  const { nome, endereco, telefone, horario } = unidade;

  return (
    <div className={styles.corpo}>
      <p className={styles.nome}>{nome}</p>

      <address className={styles.detalhes}>
        <span className={styles.linha}>
          <MapPinIcon size={16} className={styles.icone} />
          <span>{endereco}</span>
        </span>
        <span className={styles.linha}>
          <PhoneIcon size={16} className={styles.icone} />
          {/* Função real: em celular abre o discador; em desktop, o app de chamadas. */}
          <a href={paraLinkTelefone(telefone)}>{telefone}</a>
        </span>
        <span className={styles.linha}>
          <ClockIcon size={16} className={styles.icone} />
          <span>{horario}</span>
        </span>
      </address>

      {/* Destino externo: abre em outra aba para não tirar a pessoa do painel.
          `noreferrer` junto de `noopener` por segurança ao abrir link externo. */}
      <a
        href={linkDoMapa(unidade)}
        className={styles.mapa}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver no mapa
        <ArrowRightIcon size={16} />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    </div>
  );
}
