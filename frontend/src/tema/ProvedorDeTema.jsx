import { useCallback, useEffect, useMemo, useState } from "react";

import { ContextoDoTema, temaInicial, CHAVE_DO_TEMA } from "./contextoDoTema.js";

/**
 * Tema claro/escuro do site inteiro (público, paciente, médico e admin).
 *
 * Aplica `data-tema` no <html>; as cores escuras vêm de styles/temaEscuro.css,
 * que só redefine tokens. A escolha fica salva no navegador e vale para todas
 * as telas. Sem escolha salva, segue o sistema operacional.
 */
export default function ProvedorDeTema({ children }) {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE_DO_TEMA, tema);
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
    const raiz = document.documentElement;
    raiz.dataset.tema = tema;
    raiz.style.colorScheme = tema === "escuro" ? "dark" : "light";
  }, [tema]);

  const alternarTema = useCallback(() => setTema((atual) => (atual === "escuro" ? "claro" : "escuro")), []);
  const definirTema = useCallback((novo) => setTema(novo === "escuro" ? "escuro" : "claro"), []);

  const valor = useMemo(() => ({ tema, alternarTema, definirTema }), [tema, alternarTema, definirTema]);
  return <ContextoDoTema.Provider value={valor}>{children}</ContextoDoTema.Provider>;
}
