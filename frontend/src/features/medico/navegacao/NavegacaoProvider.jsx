import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AvailabilityNotice from "../../../components/AvailabilityNotice/AvailabilityNotice.jsx";
import { useAuth } from "../../auth/auth.context.js";
import { acaoDe, caminhoDe, rotaExiste, rotuloDe } from "../rotas.js";
import { NavegacaoContext } from "./contexto.js";

/* ============================================================================
   PONTO ÚNICO DE NAVEGAÇÃO DO PAINEL
   ============================================================================

   Todo botão do painel que leva a outra tela passa por aqui. A vantagem é
   existir UM lugar decidindo o que acontece: se a rota já está no roteador,
   navega; se ainda não, abre o aviso de "em breve" dizendo para onde iria.

   O aviso reaproveita o `AvailabilityNotice` do site institucional, para a
   área logada não inventar uma segunda linguagem para a mesma situação.
   ========================================================================= */

export function NavegacaoProvider({ children }) {
  const navigate = useNavigate();
  const { sair } = useAuth();

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

      /* Encerrar a sessão antes de sair da área logada. Navegar primeiro
         faria o RotaProtegida devolver a pessoa para o painel, porque o
         token ainda estaria válido. */
      if (acaoDe(destino) === "sair") {
        sair();
        navigate(caminho, { replace: true });
        return;
      }

      if (rotaExiste(destino)) {
        navigate(caminho);
        return;
      }

      /* Mostrar o caminho no aviso ajuda a equipe a conferir o destino sem
         abrir o código. Cada rota que entrar no App.jsx some daqui sozinha,
         bastando virar o `existe` em rotas.js. */
      setAviso({
        title: rotuloDe(destino),
        query: detalhe ? `${detalhe} · ${caminho}` : caminho,
      });
      avisoRef.current?.showModal();
    },
    [navigate, sair],
  );

  /**
   * Aviso para algo que não está em `rotas.js` — o rodapé, por exemplo, é
   * compartilhado com as outras telas e não conhece os destinos do médico.
   */
  const avisarEmBreve = useCallback((titulo, detalhe) => {
    setAviso({ title: titulo, query: detalhe ?? "" });
    avisoRef.current?.showModal();
  }, []);

  const valor = useMemo(() => ({ irPara, avisarEmBreve }), [irPara, avisarEmBreve]);

  return (
    <NavegacaoContext.Provider value={valor}>
      {children}
      <AvailabilityNotice ref={avisoRef} title={aviso.title} query={aviso.query} />
    </NavegacaoContext.Provider>
  );
}
