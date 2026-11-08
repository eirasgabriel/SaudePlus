import { useCallback, useEffect, useState } from "react";

const CHAVE = "saudeplus:tema";

/* Sem escolha salva, segue o sistema operacional. Tudo em try/catch: em aba
   anônima ou com armazenamento bloqueado, o tema só não fica salvo. */
function temaInicial() {
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo === "claro" || salvo === "escuro") return salvo;
  } catch {
    /* sem armazenamento: cai no padrão do sistema */
  }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "escuro";
  }
  return "claro";
}

/**
 * Tema claro/escuro da área do médico.
 *
 * Devolve `{ tema, alternarTema }`. Quem usa aplica `data-tema={tema}` no
 * elemento raiz da área; as cores escuras vêm de `temaEscuro.css`. A escolha
 * fica salva e vale para todas as telas do médico.
 */
export function useTema() {
  const [tema, setTema] = useState(() => (typeof window === "undefined" ? "claro" : temaInicial()));

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, tema);
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
    /* O fundo fora da página (rolagem elástica) e os controles nativos
       acompanham o tema enquanto a área do médico estiver aberta. */
    const raiz = document.documentElement;
    raiz.style.colorScheme = tema === "escuro" ? "dark" : "";
    raiz.dataset.temaPainel = tema;
    return () => {
      raiz.style.colorScheme = "";
      delete raiz.dataset.temaPainel;
    };
  }, [tema]);

  const alternarTema = useCallback(() => setTema((atual) => (atual === "escuro" ? "claro" : "escuro")), []);

  return { tema, alternarTema };
}
