import { useEffect, useState } from "react";

import Dialogo from "../../../components/Dialogo.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import * as api from "../admin.api.js";
import proprios from "./ModalNovoUsuario.module.css";

/**
 * Liga e desliga as formas de pagamento aceitas na baixa de cobranças.
 * Precisa ficar ao menos uma; cobranças já pagas não mudam.
 */
export default function ModalFormasPagamento({ aberto, aoFechar, aoSalvar }) {
  const [formas, setFormas] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto) return undefined;
    const controle = new AbortController();
    api
      .listarFormasDePagamento({ sinal: controle.signal })
      .then((lista) => {
        if (!controle.signal.aborted) {
          setFormas(lista);
          setErro(null);
        }
      })
      .catch((falha) => {
        if (!controle.signal.aborted) setErro(falha.message);
      });
    return () => controle.abort();
  }, [aberto]);

  const alternar = (forma) =>
    setFormas((atuais) => atuais.map((f) => (f.forma === forma ? { ...f, ativa: !f.ativa } : f)));

  const salvar = async (evento) => {
    evento.preventDefault();
    const ativas = formas.filter((f) => f.ativa).map((f) => f.forma);
    if (!ativas.length) {
      setErro("Deixe ao menos uma forma de pagamento ativa.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await api.definirFormasDePagamento(ativas);
      aoSalvar?.();
      aoFechar();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Formas de pagamento"
      descricao="Forma desativada não pode ser usada para dar baixa em cobranças.">
      <form className={dlg.formulario} onSubmit={salvar}>
        {formas ? (
          <fieldset className={dlg.campo}>
            <legend className={dlg.rotulo}>Aceitas na baixa</legend>
            <div className={proprios.opcoes}>
              {formas.map((f) => (
                <label key={f.forma} className={proprios.opcao}>
                  <input type="checkbox" checked={f.ativa} onChange={() => alternar(f.forma)} />
                  {f.rotulo}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          !erro && <p className={dlg.aviso}>Carregando…</p>
        )}
        {erro && <p className={dlg.erro} role="alert">{erro}</p>}
        <div className={dlg.acoes}>
          <button type="button" className={dlg.botaoSecundario} onClick={aoFechar}>Cancelar</button>
          <button type="submit" className={dlg.botaoPrimario} disabled={enviando || !formas}>
            {enviando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </Dialogo>
  );
}
