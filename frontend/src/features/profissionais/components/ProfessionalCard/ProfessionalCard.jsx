import { useState } from "react";
import Button from "../../../../components/Button/Button.jsx";
import Rating from "../../../../components/Rating/Rating.jsx";
import { VerifiedIcon, MapPinIcon, BuildingIcon, VideoChatIcon, ClockOutlineIcon, ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./ProfessionalCard.module.css";

const TYPE_LABELS = {
  presencial: { label: "Consulta presencial", icon: BuildingIcon },
  online: { label: "Consulta on-line", icon: VideoChatIcon },
  domiciliar: { label: "Atendimento domiciliar", icon: BuildingIcon },
};

/** Profissional na lista de resultados da busca. */
export default function ProfessionalCard({ id, name, specialty, crm, rating, reviews, address, types, slots, photo, className, onUnavailable }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  return (
    <article className={cx(styles.card, className)} aria-labelledby={`pro-${id}`}>
      <img className={styles.photo} src={photo} alt={`Foto de ${name}`} width="110" height="107" loading="lazy" />

      <div className={styles.info}>
        <h3 id={`pro-${id}`} className={styles.name}>
          {name}
          <VerifiedIcon size={20} className={styles.verified} aria-label="Profissional verificado" />
        </h3>
        <p className={styles.meta}>
          <span className={styles.tag}>{specialty}</span>
          <span>{crm}</span>
        </p>
        <Rating value={rating} reviews={reviews} size="sm" className={styles.rating} />
        <p className={styles.address}>
          <MapPinIcon size={14} className={styles.pin} />
          {address}
        </p>
        <ul className={styles.types}>
          {types.map((t) => {
            const { label, icon: Icon } = TYPE_LABELS[t];
            return (
              <li key={t} className={styles.type}>
                <Icon size={12} />
                {label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.slots}>
        <p className={styles.slotsTitle}>
          <ClockOutlineIcon size={15} />
          Horários ilustrativos
        </p>
        <ul className={styles.slotGrid}>
          {slots.map((slot) => (
            <li key={slot}>
              <button
                type="button"
                className={cx(styles.slot, selectedSlot === slot && styles.slotSelected)}
                aria-pressed={selectedSlot === slot}
                onClick={() => setSelectedSlot((current) => (current === slot ? null : slot))}
              >
                {slot}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => onUnavailable("Mais horários", name)} className={styles.moreSlots}>
          Ver mais horários
          <ArrowRightIcon size={14} />
        </button>
      </div>

      <div className={styles.actions}>
        <Button onClick={() => onUnavailable("Perfil completo", name)} className={styles.action}>Ver perfil</Button>
        <Button
          variant="outline"
          onClick={() => onUnavailable("Agendar consulta", `${name}${selectedSlot ? ` — ${selectedSlot}` : ""}`)}
          className={styles.action}
        >
          Agendar consulta
        </Button>
      </div>
    </article>
  );
}
