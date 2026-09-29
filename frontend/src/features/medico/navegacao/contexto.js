import { createContext } from "react";

/* Só o objeto de contexto mora aqui.
   Separar o contexto, o provider e o hook em três arquivos é exigência do
   fast refresh do Vite: um arquivo que exporta componente e função solta
   perde o recarregamento a quente durante o desenvolvimento. */
export const NavegacaoContext = createContext(null);
