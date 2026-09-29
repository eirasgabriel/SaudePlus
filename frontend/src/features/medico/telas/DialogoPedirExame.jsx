import { useEffect, useState } from "react";

import Dialogo from "../../../components/Dialogo.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import { listarTiposDeExame, solicitarExame } from "../medico.api.js";

/**
 * Pedido de exame para um paciente do médico. Com `agendamentoOrigemId`, o
 * exame fica ligado à consulta e aparece no detalhe dela.
 *
 * `aoPedir(exame)` roda depois do pedido aceito.
 */
export default function DialogoPedirExame({ aberto, aoFechar, pacienteId, paciente, agendamentoOrigemId, aoPedir }) {
  const [tipos, setTipos] = useState([]);
  const [tipoExameId, setTipoExameId] = useState("");
  const [prazo, setPrazo] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // O catálogo só é buscado quando o diálogo abre pela primeira vez.
  useEffect(() => {
    if (!aberto || tipos.length) return undefined;
    const controle = new AbortController();
    listarTiposDeExame({ sinal: controle.signal })
      .then((lista) => {
        if (!controle.signal.aborted) setTipos(lista);
      })
      .catch((falha) => {
        if (!controle.signal.aborted) setErro(falha.message);
      });
    return () => controle.abort();
  }, [aberto, tipos.length]);

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!tipoExameId) {
      setErro("Escolha o exame.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const exame = await solicitarExame({ pacienteId, tipoExameId, prazo: prazo || undefined, agendamentoOrigemId });
      setTipoExameId("");
      setPrazo("");
      aoPedir?.(exame);
      aoFechar();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  };

  const escolhido = tipos.find((t) => t.id === tipoExameId);

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Pedir exame" descricao={paciente ? `Para ${paciente}.` : undefined}>
      <form className={dlg.formulario} onSubmit={enviar} noValidate>
        <div className={dlg.campo}>
          <label className={dlg.rotulo} htmlFor="pedido-tipo">Exame</label>
          <select id="pedido-tipo" className={dlg.select} value={tipoExameId} onChange={(e) => setTipoExameId(e.target.value)}>
            <option value="">{tipos.length ? "Escolha…" : "Carregando…"}</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
          {escolhido?.preparo && <p className={dlg.aviso}>Preparo: {escolhido.preparo}</p>}
        </div>
        <div className={dlg.campo}>
          <label className={dlg.rotulo} htmlFor="pedido-prazo">Prazo para o resultado (opcional)</label>
          <input id="pedido-prazo" type="date" className={dlg.input} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </div>
        {erro && <p className={dlg.erro} role="alert">{erro}</p>}
        <div className={dlg.acoes}>
          <button type="button" className={dlg.botaoSecundario} onClick={aoFechar}>Cancelar</button>
          <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>
            {enviando ? "Pedindo…" : "Pedir exame"}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
