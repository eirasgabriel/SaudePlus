import { useCallback, useEffect, useState } from "react";

const INICIAL = { origem: "carregando", dados: null, erro: null };

/**
 * Carrega dados da API para uma tela.
 *
 * O sistema não usa dados de demonstração: se a API falhar, devolve
 * `origem: "erro"` com o erro, e a tela mostra a falha com "Tentar de novo"
 * (ver components/PortaoDaApi). Estados de `origem`: "carregando" | "api" | "erro".
 *
 * `carregar` recebe `{ sinal }` e devolve uma promessa; precisa ser estável
 * (declarada fora do componente ou com useCallback).
 */
export function useDadosDaApi(carregar) {
  const [estado, setEstado] = useState(INICIAL);

  // Só grava estado quando a resposta chega: não há setState síncrono no efeito.
  const buscar = useCallback(
    (sinal) =>
      carregar({ sinal })
        .then((dados) => {
          if (!sinal?.aborted) setEstado({ origem: "api", dados, erro: null });
        })
        .catch((erro) => {
          if (!sinal?.aborted) setEstado({ origem: "erro", dados: null, erro });
        }),
    [carregar],
  );

  useEffect(() => {
    const controle = new AbortController();
    buscar(controle.signal);
    return () => controle.abort();
  }, [buscar]);

  /* Depois de uma ação (reservar, cancelar), relê sem voltar a "carregando":
     a tela continua mostrando os dados atuais até os novos chegarem. */
  const recarregar = useCallback(() => buscar(), [buscar]);

  /* "Tentar de novo" depois de uma falha: volta a "carregando" para a pessoa
     ver que a nova tentativa está em andamento. */
  const tentarDeNovo = useCallback(() => {
    setEstado(INICIAL);
    return buscar();
  }, [buscar]);

  return { ...estado, recarregar, tentarDeNovo };
}
