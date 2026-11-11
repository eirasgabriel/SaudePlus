import Button from "../../../../components/Button/Button.jsx";
import Rating from "../../../../components/Rating/Rating.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./DoctorCard.module.css";

/** "Dra. Camila Duarte" → "CD": o título não entra nas iniciais. */
function iniciais(nome = "") {
  const partes = nome.replace(/^(dra?\.?)\s+/i, "").split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes.at(-1)[0] : "")).toUpperCase();
}

/**
 * Vaga ainda sem profissional no ranking: o mesmo cartão, em branco. Repete a
 * estrutura com o conteúdo invisível para ter exatamente a mesma altura.
 */
export function DoctorCardVazio({ className }) {
  return (
    <article className={cx(styles.card, styles.vazio, className)} aria-hidden="true">
      <span className={cx(styles.photo, styles.photoEmBranco)} />
      <div className={cx(styles.body, styles.invisivel)}>
        <span className={styles.tag}>&nbsp;</span>
        <span className={styles.name}>&nbsp;</span>
        <Rating value={0} reviews={0} size="md" className={styles.rating} />
        <span className={cx(styles.button, styles.botaoEmBranco)} />
      </div>
    </article>
  );
}

/**
 * Card compacto de profissional em destaque. Com `perfilHref` (dados da API),
 * "Ver perfil" abre o perfil; sem ele (demonstração), busca pelo nome.
 */
export default function DoctorCard({ name, specialty, rating, reviews, photo, perfilHref, className }) {
  return (
    <article className={cx(styles.card, className)}>
      {photo ? (
        <img className={styles.photo} src={photo} alt={`Foto de ${name}`} width="106" height="117" loading="lazy" />
      ) : (
        <span className={cx(styles.photo, styles.photoVazia)} aria-hidden="true">{iniciais(name)}</span>
      )}
      <div className={styles.body}>
        <span className={styles.tag}>{specialty}</span>
        <h3 className={styles.name}>{name}</h3>
        <Rating value={rating} reviews={reviews} size="md" className={styles.rating} />
        <Button to={perfilHref ?? `/buscar?q=${encodeURIComponent(name)}`} className={styles.button}>Ver perfil</Button>
      </div>
    </article>
  );
}
