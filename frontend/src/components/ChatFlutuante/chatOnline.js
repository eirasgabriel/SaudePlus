import { createContext, useContext } from "react";

/**
 * Abre o chat online de qualquer tela dentro do <ChatFlutuante> (o MainLayout
 * envolve todo o site público). Separado do componente por causa do Fast
 * Refresh do Vite, que exige arquivos .jsx só com componentes.
 */
export const ChatOnlineContexto = createContext(null);

/** `{ abrir }`, ou null fora do <ChatFlutuante>. */
export function useChatOnline() {
  return useContext(ChatOnlineContexto);
}
