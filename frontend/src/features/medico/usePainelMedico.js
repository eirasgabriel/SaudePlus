import { useCallback, useEffect, useState } from "react";

import { buscarPainel } from "./medico.api.js";

const INICIAL = { origem: "carregando", dados: null, erro: null };

/**
 * Carrega o painel do médico logado da API (o médico vem do token).
 *
 * Quando a API não responde, o hook não derruba a tela: devolve
 * `origem: "mocks"` e quem chama renderiza com os dados locais. Isso mantém o
 * painel utilizável enquanto o back-end não está de pé — situação normal para
 * quem só está mexendo no front-end.
 *
 * Estados possíveis de `origem`: "carregando" | "api" | "mocks".
 */
export function usePainelMedico({ data } = {}) {
  const [estado, setEstado] = useState(INICIAL);

  /* Só grava estado quando a resposta chega: o estado inicial já é
     "carregando", então não há setState síncrono dentro do efeito. */
  const buscar = useCallback(
    (sinal) =>
      buscarPainel({ data, sinal })
        .then((dados) => {
          if (!sinal?.aborted) setEstado({ origem: "api", dados, erro: null });
        })
        .catch((erro) => {
          if (!sinal?.aborted) setEstado({ origem: "mocks", dados: null, erro });
        }),
    [data],
  );

  useEffect(() => {
    const controle = new AbortController();
    buscar(controle.signal);
    return () => controle.abort();
  }, [buscar]);

  /* Ação da pessoa, fora do efeito: aqui voltar para "carregando" é o
     comportamento esperado — o aviso some enquanto a tentativa acontece. */
  const recarregar = useCallback(() => {
    setEstado(INICIAL);
    return buscar();
  }, [buscar]);

  return { ...estado, recarregar };
}
