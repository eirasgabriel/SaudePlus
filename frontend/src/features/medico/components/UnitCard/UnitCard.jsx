import { MapPinIcon, PhoneIcon, ClockIcon, ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./UnitCard.module.css";

/** "(22) 2655-1234" -> "tel:+552226551234" */
const paraLinkTelefone = (telefone) => `tel:+55${telefone.replace(/\D/g, "")}`;

/**
 * Monta o link do mapa.
 *
 * Se a unidade já tiver um `mapUrl` de verdade, ele manda. Sem ele, montamos
 * a busca do Google Maps pelo nome e endereço — é um destino externo real, e
 * esconder o botão só porque o banco não guardou a URL tira uma função que
 * funciona.
 *
 * Quando o back-end passar a guardar coordenadas, troque por
 * `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.
 */
function linkDoMapa({ mapUrl, nome, endereco }) {
  if (mapUrl && mapUrl !== "#") return mapUrl;
  if (!endereco) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome} ${endereco}`)}`;
}

/**
 * Dados da unidade onde o médico atende. Sem unidade (médico ainda não
 * vinculado), mostra um aviso; telefone, horário e mapa são opcionais.
 */
export default function UnitCard({ unidade }) {
  if (!unidade) {
    return (
      <div className={styles.corpo}>
        <p className={styles.nome}>Nenhuma unidade vinculada</p>
        <p className={styles.detalhes}>A administração ainda não associou você a uma unidade de atendimento.</p>
      </div>
    );
  }
  const { nome, endereco, telefone, horario } = unidade;
  const mapa = linkDoMapa(unidade);

  return (
    <div className={styles.corpo}>
      <p className={styles.nome}>{nome}</p>

      <address className={styles.detalhes}>
        <span className={styles.linha}>
          <MapPinIcon size={16} className={styles.icone} />
          <span>{endereco}</span>
        </span>
        {telefone && (
          <span className={styles.linha}>
            <PhoneIcon size={16} className={styles.icone} />
            <a href={paraLinkTelefone(telefone)}>{telefone}</a>
          </span>
        )}
        {horario && (
          <span className={styles.linha}>
            <ClockIcon size={16} className={styles.icone} />
            <span>{horario}</span>
          </span>
        )}
      </address>

      {mapa && (
        /* Destino externo: abre em outra aba para não tirar a pessoa do painel.
           `noreferrer` junto de `noopener` por segurança ao abrir link externo. */
        <a href={mapa} className={styles.mapa} target="_blank" rel="noopener noreferrer">
          Ver no mapa
          <ArrowRightIcon size={16} />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      )}
    </div>
  );
}
