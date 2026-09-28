import { useCallback, useMemo, useRef, useState } from "react";

// ATIVAR ROTAS (passo 3): descomente a linha abaixo.
// import { useNavigate } from "react-router-dom";

import AvailabilityNotice from "../../../components/AvailabilityNotice/AvailabilityNotice.jsx";
import { caminhoDe, ROTAS_ATIVAS, rotuloDe } from "../rotas.js";
import { NavegacaoContext } from "./contexto.js";

/* ============================================================================
   PONTO ÚNICO DE NAVEGAÇÃO DO PAINEL
   ============================================================================

   Todo botão do painel que leva a outra tela passa por aqui. A vantagem é
   existir UM lugar decidindo o que acontece: enquanto as telas não existem,
   abre o aviso de "em breve"; quando existirem, navega.

   O aviso reaproveita o `AvailabilityNotice` do site institucional, para a
   área logada não inventar uma segunda linguagem para a mesma situação.
   ========================================================================= */

export function NavegacaoProvider({ children }) {
  // ATIVAR ROTAS (passo 3): descomente a linha abaixo.
  // const navigate = useNavigate();

  const avisoRef = useRef(null);
  const [aviso, setAviso] = useState({ title: "", query: "" });

  /**
   * Leva a pessoa a um destino de `rotas.js`.
   *
   * @param destino     chave de ROTAS, ex.: "agenda", "prontuario"
   * @param parametros  valores dos `:parametros` do caminho
   * @param detalhe     texto extra no aviso (o termo buscado, por exemplo)
   */
  const irPara = useCallback(
    (destino, { parametros, detalhe } = {}) => {
      const caminho = caminhoDe(destino, parametros);

      if (ROTAS_ATIVAS) {
        // ATIVAR ROTAS (passo 3): descomente a linha abaixo.
        // navigate(caminho);
        return;
      }

      // Mostrar o caminho no aviso ajuda a equipe a conferir o destino sem
      // abrir o código. Quando as rotas existirem, este bloco some.
      setAviso({
        title: rotuloDe(destino),
        query: detalhe ? `${detalhe} · ${caminho}` : caminho,
      });
      avisoRef.current?.showModal();
    },
    // ATIVAR ROTAS: acrescente `navigate` às dependências.
    [],
  );

  /**
   * Aviso para algo que não está em `rotas.js` — o rodapé, por exemplo, é
   * compartilhado com as outras telas e não conhece os destinos do médico.
   */
  const avisarEmBreve = useCallback((titulo, detalhe) => {
    setAviso({ title: titulo, query: detalhe ?? "" });
    avisoRef.current?.showModal();
  }, []);

  const valor = useMemo(
    () => ({ irPara, avisarEmBreve, rotasAtivas: ROTAS_ATIVAS }),
    [irPara, avisarEmBreve],
  );

  return (
    <NavegacaoContext.Provider value={valor}>
      {children}
      <AvailabilityNotice ref={avisoRef} title={aviso.title} query={aviso.query} />
    </NavegacaoContext.Provider>
  );
}
