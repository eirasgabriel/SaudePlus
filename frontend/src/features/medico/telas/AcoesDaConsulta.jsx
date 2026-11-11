import { useState } from "react";

import Dialogo from "../../../components/Dialogo.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import estilos from "../../../styles/telas.module.css";
import { atualizarStatusDaConsulta } from "../medico.api.js";

/**
 * Próximos passos de cada status, na ordem em que aparecem. Espelha
 * `StatusAgendamento.seguintes()` do back-end, que é quem decide de verdade
 * (transição inválida responde 422). "em_andamento → realizada" não está
 * aqui: acontece ao registrar o atendimento.
 */
const ACOES_POR_STATUS = {
  pendente: [{ status: "confirmada", rotulo: "Confirmar" }],
  confirmada: [
    { status: "aguardando", rotulo: "Registrar chegada" },
    { status: "faltou", rotulo: "Não compareceu", perigo: true },
  ],
  aguardando: [{ status: "em_andamento", rotulo: "Iniciar atendimento" }],
};

const CANCELAVEIS = new Set(["pendente", "confirmada"]);

/* Só no dia da consulta: antes disso o paciente não chegou nem faltou. */
const SO_NO_DIA = new Set(["aguardando", "em_andamento", "faltou"]);

const hojeIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Botões para mover a consulta de status, com o cancelamento pedindo o
 * motivo (o paciente recebe o aviso). `aoMudar(consultaAtualizada)` roda
 * depois de cada mudança; `aoErrar(falha)` recebe a recusa do servidor.
 */
export default function AcoesDaConsulta({ consulta, data = consulta.data, aoMudar, aoErrar }) {
  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");

  const mudar = async (status, extra) => {
    setEnviando(true);
    try {
      aoMudar?.(await atualizarStatusDaConsulta(consulta.id, status, extra));
      return true;
    } catch (falha) {
      aoErrar?.(falha);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const futura = Boolean(data) && data > hojeIso();
  const todas = ACOES_POR_STATUS[consulta.status] ?? [];
  const acoes = futura ? todas.filter((acao) => !SO_NO_DIA.has(acao.status)) : todas;
  const esperandoODia = futura && acoes.length < todas.length;
  if (!acoes.length && !CANCELAVEIS.has(consulta.status)) {
    return esperandoODia ? <p className={estilos.dicaDoDia}>Chegada e atendimento ficam disponíveis no dia da consulta.</p> : null;
  }

  return (
    <div className={estilos.botoes}>
      {esperandoODia && (
        <p className={estilos.dicaDoDia}>Chegada e atendimento ficam disponíveis no dia da consulta.</p>
      )}
      {acoes.map((acao) => (
        <button
          key={acao.status}
          type="button"
          className={acao.perigo ? estilos.botaoPerigo : estilos.botao}
          disabled={enviando}
          onClick={() => mudar(acao.status)}
        >
          {acao.rotulo}
        </button>
      ))}
      {CANCELAVEIS.has(consulta.status) && (
        <button
          type="button"
          className={estilos.botaoPerigo}
          disabled={enviando}
          onClick={() => {
            setMotivo("");
            setCancelando(true);
          }}
        >
          Cancelar
        </button>
      )}

      <Dialogo
        aberto={cancelando}
        aoFechar={() => setCancelando(false)}
        titulo="Cancelar consulta"
        descricao={`${consulta.paciente ?? "O paciente"} recebe um aviso com o motivo.`}
      >
        <form
          className={dlg.formulario}
          onSubmit={async (evento) => {
            evento.preventDefault();
            if (await mudar("cancelada", { motivo: motivo.trim() || undefined })) setCancelando(false);
          }}
        >
          <div className={dlg.campo}>
            <label className={dlg.rotulo} htmlFor={`motivo-${consulta.id}`}>Motivo (opcional)</label>
            <textarea
              id={`motivo-${consulta.id}`}
              className={dlg.input}
              maxLength={300}
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
          <div className={dlg.acoes}>
            <button type="button" className={dlg.botaoSecundario} onClick={() => setCancelando(false)}>
              Voltar
            </button>
            <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>
              {enviando ? "Cancelando…" : "Cancelar consulta"}
            </button>
          </div>
        </form>
      </Dialogo>
    </div>
  );
}
