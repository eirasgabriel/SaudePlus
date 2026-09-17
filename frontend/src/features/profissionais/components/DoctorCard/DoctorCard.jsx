import Button from "../../../../components/Button/Button.jsx";
import Rating from "../../../../components/Rating/Rating.jsx";
import { cx } from "../../../../utils/cx.js";
import styles from "./DoctorCard.module.css";

/** Card compacto de profissional em destaque. */
export default function DoctorCard({ id, name, specialty, rating, reviews, photo, className }) {
  return (
    <article className={cx(styles.card, className)}>
      <img className={styles.photo} src={photo} alt={`Foto de ${name}`} width="106" height="117" loading="lazy" />
      <div className={styles.body}>
        <span className={styles.tag}>{specialty}</span>
        <h3 className={styles.name}>{name}</h3>
        <Rating value={rating} reviews={reviews} size="md" className={styles.rating} />
        <Button to={`/buscar?profissional=${id}`} className={styles.button}>Ver perfil</Button>
      </div>
    </article>
  );
}
