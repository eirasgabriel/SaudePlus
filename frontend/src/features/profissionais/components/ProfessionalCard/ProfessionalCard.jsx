import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../components/Button/Button.jsx";
import Rating from "../../../../components/Rating/Rating.jsx";
import { VerifiedIcon, MapPinIcon, BuildingIcon, VideoChatIcon, ClockOutlineIcon, ArrowRightIcon } from "../../../../components/icons/Icons.jsx";
import { cx } from "../../../../utils/cx.js";
import { rotuloDoDia } from "../../perfil.js";
import styles from "./ProfessionalCard.module.css";

const TYPE_LABELS = {
  presencial: { label: "Consulta presencial", icon: BuildingIcon },
  online: { label: "Consulta on-line", icon: VideoChatIcon },
  domiciliar: { label: "Atendimento domiciliar", icon: BuildingIcon },
};

/** "Dra. Camila Duarte" → "CD": o título não entra nas iniciais. */
function iniciais(nome = "") {
  const partes = nome.replace(/^(dra?\.?)\s+/i, "").split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes.at(-1)[0] : "")).toUpperCase();
}

/**
 * Profissional na lista de resultados da busca. Sem foto, mostra as
 * iniciais; sem horários livres conhecidos, só o botão de ver a agenda.
 *
 * Com `perfilHref` e `agendarHref(horario)` (dados da API), "Ver perfil",
 * "Ver mais horários" e "Agendar consulta" navegam; sem eles (profissionais
 * de demonstração), avisam por `onUnavailable`.
 */
export default function ProfessionalCard({
  id, name, specialty, crm, rating, reviews, address, types, slots, slotsDate, photo, className,
  onUnavailable, perfilHref, agendarHref,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  return (
    <article className={cx(styles.card, className)} aria-labelledby={`pro-${id}`}>
      {photo ? (
        <img className={styles.photo} src={photo} alt={`Foto de ${name}`} width="110" height="107" loading="lazy" />
      ) : (
        <span className={cx(styles.photo, styles.photoVazia)} aria-hidden="true">{iniciais(name)}</span>
      )}

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
          {slots.length ? `Próximos horários${slotsDate ? ` · ${rotuloDoDia(slotsDate)}` : ""}` : "Horários"}
        </p>
        {slots.length > 0 && (
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
        )}
        {perfilHref ? (
          <Link to={perfilHref} className={styles.moreSlots}>
            {slots.length ? "Ver mais horários" : "Ver agenda"}
            <ArrowRightIcon size={14} />
          </Link>
        ) : (
          <button type="button" onClick={() => onUnavailable("Mais horários", name)} className={styles.moreSlots}>
            {slots.length ? "Ver mais horários" : "Ver agenda"}
            <ArrowRightIcon size={14} />
          </button>
        )}
      </div>

      <div className={styles.actions}>
        {perfilHref ? (
          <Button to={perfilHref} className={styles.action}>Ver perfil</Button>
        ) : (
          <Button onClick={() => onUnavailable("Perfil completo", name)} className={styles.action}>Ver perfil</Button>
        )}
        {agendarHref ? (
          <Button variant="outline" to={agendarHref(selectedSlot)} className={styles.action}>
            Agendar consulta{selectedSlot ? <span className="sr-only"> às {selectedSlot}</span> : null}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => onUnavailable("Agendar consulta", `${name}${selectedSlot ? ` — ${selectedSlot}` : ""}`)}
            className={styles.action}
          >
            Agendar consulta
          </Button>
        )}
      </div>
    </article>
  );
}
