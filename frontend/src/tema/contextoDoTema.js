import { createContext, useContext } from "react";

export const CHAVE_DO_TEMA = "saudeplus:tema";

/* Tudo em try/catch: em aba anônima ou com armazenamento bloqueado, o tema
   só não fica salvo. */
export function temaInicial() {
  if (typeof window === "undefined") return "claro";
  try {
    const salvo = window.localStorage.getItem(CHAVE_DO_TEMA);
    if (salvo === "claro" || salvo === "escuro") return salvo;
  } catch {
    /* sem armazenamento: cai no padrão do sistema */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

/* Fora do provedor (testes de componente isolado) o tema é claro e alternar
   não faz nada. */
export const ContextoDoTema = createContext({
  tema: "claro",
  alternarTema: () => {},
  definirTema: () => {},
});

/** `{ tema, alternarTema, definirTema }` do tema global do site. */
export function useTema() {
  return useContext(ContextoDoTema);
}
