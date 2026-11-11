import { useCallback, useEffect, useState } from "react";

import { listarEspecialidades, buscarProfissionais } from "../profissionais/profissionais.api.js";
import { buscarHorariosLivres } from "./paciente.api.js";

/**
 * Opções do modal de agendamento vindas da API: especialidades, os médicos
 * da especialidade escolhida e os horários livres do médico na data.
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

  return {
    origem: catalogo.origem,
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
