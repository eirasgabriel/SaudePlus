import { MapPinIcon, PhoneIcon, ClockIcon, ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import styles from "./UnitCard.module.css";

/** "(22) 2655-1234" -> "tel:+552226551234" */
const paraLinkTelefone = (telefone) => `tel:+55${telefone.replace(/\D/g, "")}`;

/** Dados da unidade onde o médico atende. */
export default function UnitCard({ unidade }) {
  const { nome, endereco, telefone, horario, mapUrl } = unidade;

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
          <a href={paraLinkTelefone(telefone)}>{telefone}</a>
        </span>
        <span className={styles.linha}>
          <ClockIcon size={16} className={styles.icone} />
          <span>{horario}</span>
        </span>
      </address>

      <a href={mapUrl} className={styles.mapa}>
        Ver no mapa
        <ArrowRightIcon size={16} />
      </a>
    </div>
  );
}
