import { useState } from "react";

import Dialogo from "./Dialogo.jsx";
import dlg from "./ModalAgendamento.module.css";

/**
 * Pergunta antes de uma ação difícil de desfazer. `aoConfirmar` devolve uma
 * promessa: se falhar, a mensagem aparece e o diálogo continua aberto.
 */
export default function DialogoConfirmacao({ aberto, aoFechar, titulo, mensagem, rotuloConfirmar = "Confirmar", aoConfirmar }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const fechar = () => {
    setErro(null);
    aoFechar();
  };

  const confirmar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      await aoConfirmar();
      aoFechar();
    } catch (falha) {
      setErro(falha?.message ?? "Não foi possível concluir.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialogo aberto={aberto} aoFechar={fechar} titulo={titulo}>
      <div className={dlg.formulario}>
        <p>{mensagem}</p>
        {erro && <p className={dlg.erro} role="alert">{erro}</p>}
        <div className={dlg.acoes}>
          <button type="button" className={dlg.botaoSecundario} onClick={fechar}>Voltar</button>
          <button type="button" className={dlg.botaoPrimario} onClick={confirmar} disabled={enviando}>
            {enviando ? "Aguarde…" : rotuloConfirmar}
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
