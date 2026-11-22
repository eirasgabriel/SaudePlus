import { useCallback, useEffect, useState } from "react";

import { listarEspecialidades, buscarProfissionais } from "../profissionais/profissionais.api.js";
import { buscarHorariosLivres, buscarHorariosLivresNoPeriodo } from "./paciente.api.js";
import { hojeIso } from "../../utils/formatos.js";

/** Até quantos dias à frente procurar dias com vaga (o servidor ainda corta na janela da agenda). */
const DIAS_PROCURADOS = 90;

/**
 * Opções do modal de agendamento vindas da API: especialidades, os médicos
 * da especialidade escolhida, os dias com vaga do médico (de hoje em diante)
 * e os horários livres do médico na data.
 *
 * Sem API (`origem: "erro"`), não há opções: o modal mostra a falha com
 * "Tentar de novo" (`tentarDeNovo`). Não existem opções de demonstração.
 *
 * Cada resposta é guardada com a "chave" do pedido que a gerou; ao trocar a
 * especialidade ou a data, a lista antiga deixa de valer na hora, sem
 * setState síncrono dentro dos efeitos.
 */
export function useOpcoesDeAgendamento({ aberto, especialidadeId, profissionalId, data, versao = 0 }) {
  const [catalogo, setCatalogo] = useState({ origem: "carregando", especialidades: [] });
  const [medicos, setMedicos] = useState({ chave: null, lista: [] });
  const [horarios, setHorarios] = useState({ chave: null, lista: [], erro: null });
  const [dias, setDias] = useState({ chave: null, lista: [], erro: null });
  // Sobe no "Tentar de novo" dos horários, para refazer só essa busca.
  const [tentativa, setTentativa] = useState(0);

  const especialidades = catalogo.especialidades;
  const especialidade = especialidades.find((item) => item.id === especialidadeId) ?? null;
  const chaveMedicos = especialidade ? especialidade.slug : null;
  const listaDeMedicos = medicos.chave === chaveMedicos ? medicos.lista : [];
  // Sem janela de disponibilidade (modalidades vazias na busca), não há o que buscar.
  // Médico fora da lista (remarcação, pedido vindo do perfil) segue buscando.
  const semAgenda = listaDeMedicos.find((m) => m.id === profissionalId)?.semAgenda === true;
  const chaveHorarios = profissionalId && data && !semAgenda ? `${profissionalId}|${data}|${versao}|${tentativa}` : null;
  const chaveDias = profissionalId && !semAgenda ? `${profissionalId}|${versao}|${tentativa}` : null;

  // Depois de uma falha, volta a "carregando" e o efeito abaixo busca de novo.
  const tentarDeNovo = useCallback(() => setCatalogo({ origem: "carregando", especialidades: [] }), []);

  useEffect(() => {
    if (!aberto || catalogo.origem !== "carregando") return undefined;
    const controle = new AbortController();
    listarEspecialidades({ sinal: controle.signal })
      .then((lista) => {
        if (!controle.signal.aborted) {
          setCatalogo({
            origem: "api",
            especialidades: lista.map((e) => ({ id: e.id, slug: e.slug, name: e.nome })),
          });
        }
      })
      .catch(() => {
        if (!controle.signal.aborted) setCatalogo({ origem: "erro", especialidades: [] });
      });
    return () => controle.abort();
  }, [aberto, catalogo.origem]);

  useEffect(() => {
    if (!chaveMedicos) return undefined;
    const controle = new AbortController();
    buscarProfissionais({ especialidade: [chaveMedicos], tamanho: 50, ordem: "nome" }, { sinal: controle.signal })
      .then((pagina) => {
        if (!controle.signal.aborted) {
          setMedicos({
            chave: chaveMedicos,
            lista: pagina.conteudo.map((p) => ({
              id: p.id,
              name: p.nome,
              // A busca deriva as modalidades das disponibilidades do médico.
              semAgenda: Array.isArray(p.modalidades) && p.modalidades.length === 0,
            })),
          });
        }
      })
      .catch(() => {
        if (!controle.signal.aborted) setMedicos({ chave: chaveMedicos, lista: [] });
      });
    return () => controle.abort();
  }, [chaveMedicos]);

  const tentarHorariosDeNovo = useCallback(() => setTentativa((n) => n + 1), []);

  useEffect(() => {
    if (!chaveHorarios) return undefined;
    const [medicoId, dia] = chaveHorarios.split("|");
    const controle = new AbortController();
    buscarHorariosLivres(medicoId, dia, { sinal: controle.signal })
      .then((livres) => {
        if (controle.signal.aborted) return;
        // O mesmo horário pode vir em duas modalidades: a tela mostra um botão por horário.
        const vistos = new Map();
        livres.forEach((livre) => {
          if (!vistos.has(livre.horario)) vistos.set(livre.horario, livre);
        });
        setHorarios({ chave: chaveHorarios, lista: [...vistos.values()], erro: null });
      })
      .catch((erro) => {
        // Falha não é "dia sem vagas": a tela mostra o erro e permite tentar de novo.
        if (!controle.signal.aborted) setHorarios({ chave: chaveHorarios, lista: [], erro });
      });
    return () => controle.abort();
  }, [chaveHorarios]);

  // Dias com pelo menos um horário livre, de hoje em diante.
  useEffect(() => {
    if (!chaveDias) return undefined;
    const [medicoId] = chaveDias.split("|");
    const controle = new AbortController();
    buscarHorariosLivresNoPeriodo(medicoId, { de: hojeIso(), ate: hojeIso(DIAS_PROCURADOS) }, { sinal: controle.signal })
      .then((livres) => {
        if (controle.signal.aborted) return;
        const hoje = hojeIso();
        const lista = [...new Set(livres.map((l) => l.data))].filter((d) => d >= hoje).sort();
        setDias({ chave: chaveDias, lista, erro: null });
      })
      .catch((erro) => {
        if (!controle.signal.aborted) setDias({ chave: chaveDias, lista: [], erro });
      });
    return () => controle.abort();
  }, [chaveDias]);

  return {
    origem: catalogo.origem,
    datasSugeridas: dias.chave === chaveDias ? dias.lista : [],
    carregandoDatas: Boolean(chaveDias) && dias.chave !== chaveDias,
    erroDatas: dias.chave === chaveDias ? dias.erro : null,
    tentarDeNovo,
    especialidades,
    profissionais: listaDeMedicos,
    horarios: horarios.chave === chaveHorarios ? horarios.lista : [],
    carregandoHorarios: Boolean(chaveHorarios) && horarios.chave !== chaveHorarios,
    erroHorarios: horarios.chave === chaveHorarios ? horarios.erro : null,
    tentarHorariosDeNovo,
    semAgenda,
  };
}
