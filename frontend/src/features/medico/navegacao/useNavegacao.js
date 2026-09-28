import { useContext } from "react";

import { NavegacaoContext } from "./contexto.js";

/**
 * Dá acesso ao `irPara` de qualquer componente do painel.
 *
 * Fora do provider devolve uma função que não faz nada, em vez de quebrar —
 * assim um componente pode ser renderizado isolado num teste ou num catálogo
 * de componentes sem precisar montar a árvore inteira.
 */
export function useNavegacao() {
  return (
    useContext(NavegacaoContext) ?? {
      irPara: () => {},
      avisarEmBreve: () => {},
      rotasAtivas: false,
    }
  );
}
