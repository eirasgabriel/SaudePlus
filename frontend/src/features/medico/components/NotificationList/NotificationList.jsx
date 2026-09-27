import { ChatDotsIcon } from "../../../../components/icons/Icons.jsx";
import { ClipboardIcon, DotIcon } from "../icons/MedicoIcons.jsx";
import styles from "./NotificationList.module.css";

/* Cada tipo de notificação tem seu ícone e sua cor. Tipo desconhecido
   cai no padrão em vez de renderizar vazio. */
const TIPOS = {
  resultado: { icone: DotIcon, tom: "tomAlerta", rotulo: "Resultado" },
  agendamento: { icone: ChatDotsIcon, tom: "tomSucesso", rotulo: "Agendamento" },
  retorno: { icone: ClipboardIcon, tom: "tomInfo", rotulo: "Retorno" },
};

const PADRAO = { icone: DotIcon, tom: "tomInfo", rotulo: "Aviso" };

export default function NotificationList({ notificacoes = [] }) {
  if (notificacoes.length === 0) {
    return <p className={styles.vazio}>Nenhuma notificação por enquanto.</p>;
  }

  return (
    <ul className={styles.lista}>
      {notificacoes.map(({ id, tipo, titulo, detalhe, quando }) => {
        const { icone: Icone, tom, rotulo } = TIPOS[tipo] ?? PADRAO;

        return (
          <li key={id} className={styles.item}>
            <span className={`${styles.icone} ${styles[tom]}`} aria-hidden="true">
              <Icone size={tipo === "resultado" ? 12 : 16} />
            </span>

            <div className={styles.info}>
              <span className={styles.titulo}>
                <span className="sr-only">{rotulo}: </span>
                {titulo}
              </span>
              <span className={styles.detalhe}>{detalhe}</span>
              <span className={styles.quando}>{quando}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
