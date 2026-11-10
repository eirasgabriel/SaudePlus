import { useCallback, useEffect, useMemo, useState } from "react";

import { buscarProfissionais, listarCidades, listarConvenios } from "./profissionais.api.js";
import { montarParametros, paraCartao } from "./buscaParametros.js";
import { paraDestaque } from "./perfil.js";
import { CITIES, INSURANCES } from "./data/buscar.js";

/* A busca vem só da API. Se ela não responder, a tela mostra o erro com
   "Tentar de novo" (origem "erro"): não há profissionais de demonstração. */

const TAMANHO_DA_PAGINA = 50;

/**
 * Resultados da busca para `{ applied, filters, sort }`.
 * `origem`: "carregando" | "api" | "erro". `tentarDeNovo` refaz a busca.
 */
export function useBuscaProfissionais(consulta) {
  const [estado, setEstado] = useState({ origem: "carregando", chave: null, resultados: [], total: 0, erro: null });
  const [tentativa, setTentativa] = useState(0);
  const tentarDeNovo = useCallback(() => {
    setEstado((atual) => ({ ...atual, origem: "carregando", chave: null }));
    setTentativa((n) => n + 1);
  }, []);

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
        setEstado({ origem: "erro", chave, resultados: [], total: 0, erro });
      });
    return () => controle.abort();
  }, [chave, parametros, tentativa]);

  // Combinação impossível de filtros: nada a buscar, lista vazia.
  if (parametros === null) {
    return { origem: estado.origem === "carregando" ? "api" : estado.origem, resultados: [], total: 0, carregando: false, tentarDeNovo };
  }
  return { ...estado, carregando: estado.chave !== chave, tentarDeNovo };
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
 * perfil. Até a API responder (ou se ela não responder), a lista fica vazia e
 * a seção não aparece: não há profissionais de demonstração.
 */
export function useDestaques(quantidade = 4) {
  const [destaques, setDestaques] = useState([]);

  useEffect(() => {
    const controle = new AbortController();
    buscarProfissionais({ ordem: "avaliacao", tamanho: quantidade }, { sinal: controle.signal })
      .then((pagina) => {
        if (!controle.signal.aborted && pagina.conteudo.length) setDestaques(pagina.conteudo.map(paraDestaque));
      })
      .catch(() => {
        // Sem API, a lista continua vazia e a seção fica oculta.
      });
    return () => controle.abort();
  }, [quantidade]);

  return destaques;
}
