import Button from '../Button/Button.jsx'
import styles from './AvailabilityNotice.module.css'

export default function AvailabilityNotice({ ref, title, query }) {
  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="notice-title" aria-describedby="notice-description">
      <h2 id="notice-title">{title}</h2>
      <p id="notice-description">
        Esta funcionalidade estará disponível em breve. O SaúdePlus está em desenvolvimento.
      </p>
      {query && <p><strong>{query}</strong></p>}
      <form method="dialog">
        <Button className={styles.close} type="submit" autoFocus>Entendi</Button>
      </form>
    </dialog>
  )
}
