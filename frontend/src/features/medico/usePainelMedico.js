import { useCallback, useEffect, useState } from "react";

import { buscarPainel } from "./medico.api.js";

const INICIAL = { origem: "carregando", dados: null, erro: null };

/**
 * Carrega o painel do médico logado da API (o médico vem do token).
 *
 * O sistema não usa dados de demonstração: quando a API não responde, o hook
 * devolve `origem: "erro"` com o erro, e a tela mostra a falha com "Tentar de
 * novo" (ver components/PortaoDaApi).
 *
 * Estados possíveis de `origem`: "carregando" | "api" | "erro".
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
          if (!sinal?.aborted) setEstado({ origem: "erro", dados: null, erro });
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
