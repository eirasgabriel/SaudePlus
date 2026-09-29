import { useCallback, useState } from "react";

import { Mensagem } from "./Telas.jsx";

/**
 * Retorno de uma ação (salvar, cancelar...): `aviso` é a mensagem pronta
 * para pôr na tela; `sucesso(texto)` e `erro(falha)` a trocam.
 */
export function useRetorno() {
  const [retorno, definir] = useState(null);
  const sucesso = useCallback((texto) => definir({ tom: "sucesso", texto }), []);
  const erro = useCallback((falha) => definir({ tom: "erro", texto: falha?.message ?? "Algo deu errado." }), []);
  const limpar = useCallback(() => definir(null), []);
  const aviso = retorno ? <Mensagem tom={retorno.tom}>{retorno.texto}</Mensagem> : null;
  return { aviso, sucesso, erro, limpar };
}
