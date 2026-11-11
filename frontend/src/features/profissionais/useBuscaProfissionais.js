import { useCallback, useEffect, useMemo, useState } from "react";

import { buscarProfissionais, listarCidades, listarConvenios, listarDestaques } from "./profissionais.api.js";
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

/** De quanto em quanto tempo os destaques são conferidos de novo com a aba visível. */
export const INTERVALO_DOS_DESTAQUES_MS = 60_000;

/**
 * Profissionais em destaque, já no formato do DoctorCard: só os perfis mais
 * abertos nos últimos 30 dias (API), sem completar com outros médicos.
 * Acompanha o ranking: a lista é buscada de novo a cada minuto e quando a aba
 * volta a ficar visível. Uma falha mantém a lista que já estava.
 */
export function useDestaques(quantidade = 4, intervaloMs = INTERVALO_DOS_DESTAQUES_MS) {
  const [destaques, setDestaques] = useState([]);

  useEffect(() => {
    let controle = null;
    let ultima = "";

    const atualizar = () => {
      controle?.abort();
      const atual = new AbortController();
      controle = atual;
      listarDestaques({ limite: quantidade }, { sinal: atual.signal })
        .then((lista) => {
          if (atual.signal.aborted || !Array.isArray(lista)) return;
          // Só re-renderiza quando algo mudou (ordem, nota, horários...).
          const assinatura = JSON.stringify(lista);
          if (assinatura === ultima) return;
          ultima = assinatura;
          setDestaques(lista.map(paraDestaque));
        })
        .catch(() => {
          // Mantém os cartões atuais; sem API desde o início, fica em branco.
        });
    };

    const visivel = () => document.visibilityState !== "hidden";
    const aoMudarVisibilidade = () => {
      if (visivel()) atualizar();
    };

    atualizar();
    const relogio = setInterval(() => {
      if (visivel()) atualizar();
    }, intervaloMs);
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    return () => {
      clearInterval(relogio);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      controle?.abort();
    };
  }, [quantidade, intervaloMs]);

  return destaques;
}
