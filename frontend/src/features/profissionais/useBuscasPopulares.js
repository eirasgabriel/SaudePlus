import { useEffect, useState } from "react";
import { listarBuscasPopulares } from "./profissionais.api.js";

/**
 * Especialidades mais buscadas (`[{ slug, nome }]`), vindas da API, e o
 * estado da carga: "carregando" | "pronto" | "erro". Sem API ou sem buscas,
 * `buscas` fica vazia: quem usa decide o que mostrar, sem inventar lista.
 */
export function useBuscasPopulares(limite = 6) {
  const [resultado, setResultado] = useState({ buscas: [], estado: "carregando" });

  useEffect(() => {
    const controle = new AbortController();
    listarBuscasPopulares({ limite }, { sinal: controle.signal })
      .then((lista) => {
        if (controle.signal.aborted) return;
        const buscas = Array.isArray(lista) ? lista.filter((b) => b?.slug && b?.nome) : [];
        setResultado({ buscas, estado: "pronto" });
      })
      .catch(() => {
        if (!controle.signal.aborted) setResultado({ buscas: [], estado: "erro" });
      });
    return () => controle.abort();
  }, [limite]);

  return resultado;
}
