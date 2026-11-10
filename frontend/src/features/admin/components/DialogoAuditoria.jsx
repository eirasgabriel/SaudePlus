import { useEffect, useState } from "react";

import Dialogo from "../../../components/Dialogo.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import { dataHoraBr } from "../../../utils/formatos.js";
import * as api from "../admin.api.js";
import proprios from "./DialogoAuditoria.module.css";

const POR_PAGINA = 20;

/** Logs de acesso: logins e ações da equipe, mais recentes primeiro. Só ADMIN. */
export default function DialogoAuditoria({ aberto, aoFechar }) {
  const [acao, setAcao] = useState("");
  const [pagina, setPagina] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const controle = new AbortController();
    api
      .buscarAuditoria({ acao: acao.trim() || undefined, pagina, tamanho: POR_PAGINA, sinal: controle.signal })
      .then((dados) => {
        if (!controle.signal.aborted) {
          setResultado(dados);
          setErro(null);
        }
      })
      .catch((falha) => {
        if (!controle.signal.aborted) setErro(falha.message);
      });
    return () => controle.abort();
  }, [aberto, acao, pagina]);

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Logs de acesso" descricao="Logins e ações registradas." largura={760}>
      <div className={dlg.formulario}>
        <div className={dlg.campo}>
          <label className={dlg.rotulo} htmlFor="auditoria-acao">Filtrar por ação (ex.: login, usuario, financeiro)</label>
          <input
            id="auditoria-acao"
            className={dlg.input}
            value={acao}
            onChange={(e) => {
              setAcao(e.target.value);
              setPagina(0);
            }}
          />
        </div>
        {erro && <p className={dlg.erro} role="alert">{erro}</p>}
        {resultado && (
          <>
            <ul className={proprios.lista}>
              {resultado.conteudo.map((r) => (
                <li key={r.id} className={proprios.item}>
                  <strong>{r.acao}</strong>
                  <span>{r.usuario ? `${r.usuario.nome} (${r.usuario.email})` : "Sistema"}</span>
                  <span className={proprios.secundario}>
                    {dataHoraBr(r.quando)}
                    {r.ip ? ` · IP ${r.ip}` : ""}
                  </span>
                </li>
              ))}
              {!resultado.conteudo.length && <li className={proprios.secundario}>Nenhum registro.</li>}
            </ul>
            <div className={dlg.acoes}>
              <button type="button" className={dlg.botaoSecundario} disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>
                Anteriores
              </button>
              <button
                type="button"
                className={dlg.botaoSecundario}
                disabled={pagina + 1 >= resultado.totalPaginas}
                onClick={() => setPagina(pagina + 1)}
              >
                Mais antigos
              </button>
            </div>
          </>
        )}
      </div>
    </Dialogo>
  );
}
