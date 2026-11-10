import { useCallback, useEffect, useState } from "react";

import Dialogo from "../../../components/Dialogo.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import * as api from "../admin.api.js";
import proprios from "./ModalNovoUsuario.module.css";

/**
 * Convênios aceitos pela rede: incluir e ativar/desativar. Convênio inativo
 * some da busca pública; nada é apagado, porque há pacientes ligados a ele.
 */
export default function ModalConvenios({ aberto, aoFechar }) {
  const [convenios, setConvenios] = useState(null);
  const [novo, setNovo] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback((sinal) =>
    api
      .listarConvenios({ sinal })
      .then((lista) => {
        if (!sinal?.aborted) setConvenios(lista);
      })
      .catch((falha) => {
        if (!sinal?.aborted) setErro(falha.message);
      }), []);

  useEffect(() => {
    if (!aberto) return undefined;
    const controle = new AbortController();
    carregar(controle.signal);
    return () => controle.abort();
  }, [aberto, carregar]);

  const executar = async (acao) => {
    setEnviando(true);
    setErro(null);
    try {
      await acao();
      await carregar();
      return true;
    } catch (falha) {
      setErro(falha.message);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const incluir = async (evento) => {
    evento.preventDefault();
    if (!novo.trim()) {
      setErro("Informe o nome do convênio.");
      return;
    }
    if (await executar(() => api.criarConvenio({ nome: novo.trim(), ativo: true }))) setNovo("");
  };

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Convênios" descricao="Convênio inativo deixa de aparecer na busca.">
      <form className={dlg.formulario} onSubmit={incluir}>
        {convenios ? (
          <fieldset className={dlg.campo}>
            <legend className={dlg.rotulo}>Ativos</legend>
            <div className={proprios.opcoes}>
              {convenios.map((c) => (
                <label key={c.id} className={proprios.opcao}>
                  <input
                    type="checkbox"
                    checked={c.ativo}
                    disabled={enviando}
                    onChange={() => executar(() => api.alterarConvenio(c.id, { nome: c.nome, ativo: !c.ativo }))}
                  />
                  {c.nome}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          !erro && <p className={dlg.aviso}>Carregando…</p>
        )}
        <div className={dlg.campo}>
          <label className={dlg.rotulo} htmlFor="novo-convenio">Novo convênio</label>
          <input id="novo-convenio" className={dlg.input} maxLength={80} value={novo} onChange={(e) => setNovo(e.target.value)} />
        </div>
        {erro && <p className={dlg.erro} role="alert">{erro}</p>}
        <div className={dlg.acoes}>
          <button type="button" className={dlg.botaoSecundario} onClick={aoFechar}>Fechar</button>
          <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>Incluir convênio</button>
        </div>
      </form>
    </Dialogo>
  );
}
