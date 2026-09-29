import { useEffect, useState } from "react";

import { listarEspecialidades, buscarProfissionais } from "../profissionais/profissionais.api.js";
import { buscarHorariosLivres } from "./paciente.api.js";
import { mockSpecialties } from "../../services/dadosficticios.js";

/**
 * Opções do modal de agendamento vindas da API: especialidades, os médicos
 * da especialidade escolhida e os horários livres do médico na data.
 *
 * Sem API (`origem: "mocks"`), cai nas opções fixas de `mockSpecialties`,
 * como o modal fazia antes — útil para mexer só no front.
 *
 * Cada resposta é guardada com a "chave" do pedido que a gerou; ao trocar a
 * especialidade ou a data, a lista antiga deixa de valer na hora, sem
 * setState síncrono dentro dos efeitos.
 */
export function useOpcoesDeAgendamento({ aberto, especialidadeId, profissionalId, data, versao = 0 }) {
  const [catalogo, setCatalogo] = useState({ origem: "carregando", especialidades: [] });
  const [medicos, setMedicos] = useState({ chave: null, lista: [] });
  const [horarios, setHorarios] = useState({ chave: null, lista: [] });

  const emMocks = catalogo.origem === "mocks";
  const especialidades = emMocks ? mockSpecialties : catalogo.especialidades;
  const especialidade = especialidades.find((item) => item.id === especialidadeId) ?? null;
  const chaveMedicos = especialidade && !emMocks ? especialidade.slug : null;
  const chaveHorarios = profissionalId && data && !emMocks ? `${profissionalId}|${data}|${versao}` : null;

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
        if (!controle.signal.aborted) setCatalogo({ origem: "mocks", especialidades: [] });
      });
    return () => controle.abort();
  }, [aberto, catalogo.origem]);

  useEffect(() => {
    if (!chaveMedicos) return undefined;
    const controle = new AbortController();
    buscarProfissionais({ especialidade: [chaveMedicos], tamanho: 50, ordem: "nome" }, { sinal: controle.signal })
      .then((pagina) => {
        if (!controle.signal.aborted) {
          setMedicos({ chave: chaveMedicos, lista: pagina.conteudo.map((p) => ({ id: p.id, name: p.nome })) });
        }
      })
      .catch(() => {
        if (!controle.signal.aborted) setMedicos({ chave: chaveMedicos, lista: [] });
      });
    return () => controle.abort();
  }, [chaveMedicos]);

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
        setHorarios({ chave: chaveHorarios, lista: [...vistos.values()] });
      })
      .catch(() => {
        if (!controle.signal.aborted) setHorarios({ chave: chaveHorarios, lista: [] });
      });
    return () => controle.abort();
  }, [chaveHorarios]);

  if (emMocks) {
    return {
      origem: "mocks",
      especialidades,
      profissionais: especialidade?.professionals ?? [],
      horarios: (especialidade?.slots ?? []).map((horario) => ({ horario })),
      carregandoHorarios: false,
    };
  }
  return {
    origem: catalogo.origem,
    especialidades,
    profissionais: medicos.chave === chaveMedicos ? medicos.lista : [],
    horarios: horarios.chave === chaveHorarios ? horarios.lista : [],
    carregandoHorarios: Boolean(chaveHorarios) && horarios.chave !== chaveHorarios,
  };
}
