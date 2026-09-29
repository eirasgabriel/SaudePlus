import { useEffect, useMemo, useState } from "react";

import { buscarProfissionais, listarCidades, listarConvenios } from "./profissionais.api.js";
import { filtrarMocks, montarParametros, paraCartao } from "./buscaParametros.js";
import { paraDestaque } from "./perfil.js";
import { CITIES, INSURANCES } from "./data/buscar.js";
import { PROFESSIONALS } from "./data/professionals.js";

/* A busca vem da API. Se ela não responder, a tela continua funcionando com
   os mocks locais (origem "mocks"), como no painel do médico. */

const TAMANHO_DA_PAGINA = 50;

/**
 * Resultados da busca para `{ applied, filters, sort }`.
 * `origem`: "carregando" | "api" | "mocks".
 */
export function useBuscaProfissionais(consulta) {
  const [estado, setEstado] = useState({ origem: "carregando", chave: null, resultados: [], total: 0, erro: null });

  // Objeto novo a cada render não pode disparar nova busca: a chave é o conteúdo.
  const chave = JSON.stringify(consulta);
  const parametros = useMemo(() => montarParametros(JSON.parse(chave), TAMANHO_DA_PAGINA), [chave]);

  useEffect(() => {
    if (parametros === null) {
      return undefined;
    }
    const controle = new AbortController();
    buscarProfissionais(parametros, { sinal: controle.signal })
      .then((pagina) => {
        if (controle.signal.aborted) return;
        setEstado({
          origem: "api",
          chave,
          resultados: pagina.conteudo.map(paraCartao),
          total: pagina.totalElementos,
          erro: null,
        });
      })
      .catch((erro) => {
        if (controle.signal.aborted) return;
        const resultados = filtrarMocks(JSON.parse(chave));
        setEstado({ origem: "mocks", chave, resultados, total: resultados.length, erro });
      });
    return () => controle.abort();
  }, [chave, parametros]);

  // Combinação impossível de filtros: nada a buscar, lista vazia.
  if (parametros === null) {
    return { origem: estado.origem === "carregando" ? "api" : estado.origem, resultados: [], total: 0, carregando: false };
  }
  return { ...estado, carregando: estado.chave !== chave };
}

/** Cidades e convênios para os filtros; os valores locais valem até a API responder. */
export function useListasDaBusca() {
  const [listas, setListas] = useState({ cidades: CITIES, convenios: INSURANCES });

  useEffect(() => {
    const controle = new AbortController();
    const sinal = controle.signal;
    Promise.all([listarCidades({ sinal }), listarConvenios({ sinal })])
      .then(([cidades, convenios]) => {
        if (sinal.aborted || !cidades.length) return;
        setListas({ cidades: cidades.map((c) => c.rotulo), convenios: convenios.map((c) => c.nome) });
      })
      .catch(() => {
        // Sem API, os filtros continuam com as listas locais.
      });
    return () => controle.abort();
  }, []);

  return listas;
}

/**
 * "Profissionais em destaque": os mais bem avaliados da API, com link para o
 * perfil. Até a API responder (ou se ela não responder), os de demonstração,
 * cujo "Ver perfil" é uma busca pelo nome.
 */
export function useDestaques(quantidade = 4) {
  const [destaques, setDestaques] = useState(PROFESSIONALS);

  useEffect(() => {
    const controle = new AbortController();
    buscarProfissionais({ ordem: "avaliacao", tamanho: quantidade }, { sinal: controle.signal })
      .then((pagina) => {
        if (!controle.signal.aborted && pagina.conteudo.length) setDestaques(pagina.conteudo.map(paraDestaque));
      })
      .catch(() => {
        // Sem API, ficam os de demonstração.
      });
    return () => controle.abort();
  }, [quantidade]);

  return destaques;
}
