import { useCallback, useEffect, useState } from "react";

const INICIAL = { origem: "carregando", dados: null, erro: null };

/**
 * Carrega dados da API para uma tela do paciente.
 *
 * Como no painel do médico, a falha não derruba a tela: devolve
 * `origem: "mocks"` e quem chama renderiza com os dados locais.
 * Estados de `origem`: "carregando" | "api" | "mocks".
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
          if (!sinal?.aborted) setEstado({ origem: "mocks", dados: null, erro });
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

  return { ...estado, recarregar };
}
