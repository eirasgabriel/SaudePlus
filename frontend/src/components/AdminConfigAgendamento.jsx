import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import { Botao } from "./Controles";
import comum from "../styles/adminComum.module.css";
import estilos from "../styles/adminConfig.module.css";
import dlg from "./ModalAgendamento.module.css";

/** Regras do grupo `agendamento`, com os limites que o servidor aceita e o padrão de application.yml. */
const REGRAS = [
  {
    id: "antecedenciaMinimaHoras",
    rotulo: "Antecedência mínima para reservar (horas)",
    ajuda: "Horários mais próximos que isso não aparecem para o paciente.",
    min: 0,
    max: 72,
    padrao: 2,
  },
  {
    id: "antecedenciaCancelamentoHoras",
    rotulo: "Antecedência mínima para o paciente cancelar ou remarcar (horas)",
    ajuda: "Depois desse prazo, só a clínica cancela.",
    min: 0,
    max: 168,
    padrao: 24,
  },
  {
    id: "janelaAgendamentoDias",
    rotulo: "Quantos dias à frente se pode reservar",
    ajuda: "Também limita os dias que a busca e o agendamento mostram.",
    min: 1,
    max: 365,
    padrao: 60,
  },
];

/**
 * Regras de reserva (Configurações > Agendamento). Valem na hora para os
 * horários públicos e para novas reservas; consultas já marcadas não mudam.
 */
export default function AdminConfigAgendamento({ valores = {}, aoSalvar }) {
  const [form, definirForm] = useState(() =>
    Object.fromEntries(REGRAS.map((r) => [r.id, String(valores?.[r.id] ?? r.padrao)])),
  );
  const [erros, definirErros] = useState({});
  const [mensagem, definirMensagem] = useState(null);
  const [salvando, definirSalvando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    const novosErros = {};
    for (const r of REGRAS) {
      const numero = Number(form[r.id]);
      if (!Number.isInteger(numero) || numero < r.min || numero > r.max) {
        novosErros[r.id] = `Use um número inteiro de ${r.min} a ${r.max}.`;
      }
    }
    definirErros(novosErros);
    definirMensagem(null);
    if (Object.keys(novosErros).length) return;
    definirSalvando(true);
    try {
      // O grupo é substituído inteiro: o que já estava gravado e não aparece aqui continua.
      await aoSalvar({ ...valores, ...Object.fromEntries(REGRAS.map((r) => [r.id, Number(form[r.id])])) });
      definirMensagem({ tom: "sucesso", texto: "Regras de agendamento salvas." });
    } catch (falha) {
      definirErros(falha?.campos ?? {});
      definirMensagem({ tom: "erro", texto: falha?.message ?? "Não foi possível salvar." });
    } finally {
      definirSalvando(false);
    }
  }

  return (
    <div className={estilos.gradePrincipal}>
      <Cartao
        titulo="Regras de Agendamento"
        subtitulo="Prazos que valem para todas as unidades e profissionais."
        icone="calendario"
      >
        <form className={dlg.formulario} onSubmit={salvar} noValidate>
          {REGRAS.map((r) => (
            <div key={r.id} className={dlg.campo}>
              <label className={dlg.rotulo} htmlFor={`regra-${r.id}`}>{r.rotulo}</label>
              <input
                id={`regra-${r.id}`}
                type="number"
                min={r.min}
                max={r.max}
                step={1}
                className={`${dlg.input} ${erros[r.id] ? dlg.campoInvalido : ""}`}
                value={form[r.id]}
                disabled={!aoSalvar}
                onChange={(e) => definirForm((atual) => ({ ...atual, [r.id]: e.target.value }))}
                aria-describedby={`regra-${r.id}-ajuda`}
              />
              <p id={`regra-${r.id}-ajuda`} className={dlg.ajuda}>{r.ajuda}</p>
              {erros[r.id] && <p className={dlg.erro}>{erros[r.id]}</p>}
            </div>
          ))}
          {mensagem && (
            <p role={mensagem.tom === "erro" ? "alert" : "status"} className={mensagem.tom === "erro" ? dlg.erro : dlg.ajuda}>
              {mensagem.texto}
            </p>
          )}
          {aoSalvar && (
            <div>
              <Botao icone="baixar" type="submit" disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar regras"}
              </Botao>
            </div>
          )}
        </form>
      </Cartao>

      <div className={estilos.coluna}>
        <div className={comum.aviso}>
          <Icone nome="info" tam={17} className={comum.avisoIcone} />
          <div>
            <div className={comum.avisoTitulo}>Importante</div>
            <p className={comum.avisoTexto}>
              Mudar estes prazos não altera consultas já marcadas. Vale para os
              horários oferecidos e para as próximas reservas e cancelamentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
