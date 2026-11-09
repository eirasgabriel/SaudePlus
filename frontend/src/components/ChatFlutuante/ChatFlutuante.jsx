import { Link } from "react-router-dom";
import { ChatDotsIcon } from "../icons/Icons.jsx";
import styles from "./ChatFlutuante.module.css";

/**
 * Botão flutuante de chat, fixo no canto inferior direito.
 * O chat online ainda não existe: o botão leva ao canal "Chat online" no
 * painel de contato da Ajuda (#fale-conosco), que mostra o status dele.
 */
export default function ChatFlutuante({ to = "/ajuda#fale-conosco" }) {
  return (
    <Link to={to} className={styles.botao} aria-label="Chat online: falar com o suporte">
      <ChatDotsIcon size={24} className={styles.icone} />
      <span className={styles.rotulo} aria-hidden="true">Chat online</span>
    </Link>
  );
}
