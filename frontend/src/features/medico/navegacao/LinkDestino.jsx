import { NavLink } from "react-router-dom";

import { acaoDe, caminhoDe, rotaExiste } from "../rotas.js";
import { useNavegacao } from "./useNavegacao.js";

/**
 * Link para um destino de `rotas.js`.
 *
 * Rota que já existe vira um `<NavLink>` de verdade: navega sem recarregar,
 * abre em nova aba com Ctrl/Cmd + clique, e marca sozinho a página atual.
 *
 * Rota ainda reservada continua sendo um `<a>` com o caminho futuro no
 * `href` — e não um `href="#"`. Isso importa por três motivos: o navegador
 * mostra o destino na barra de status, o leitor de tela anuncia "link" em vez
 * de "botão", e quando a rota subir o endereço já é o certo. O clique é
 * interceptado e abre o aviso de "em breve".
 *
 * "Sair" é o caso à parte: a rota existe, mas seguir o href deixaria a sessão
 * aberta, então o clique também é interceptado e vira a ação de logout.
 *
 * `ref` e qualquer outra prop caem no elemento final pelo `...resto` — no
 * React 19 a ref é uma prop comum, sem precisar de forwardRef.
 */
export default function LinkDestino({
  destino,
  parametros,
  detalhe,
  children,
  onClick,
  className,
  ...resto
}) {
  const { irPara } = useNavegacao();
  const caminho = caminhoDe(destino, parametros);
  const ehAcao = acaoDe(destino) !== null;

  const aoClicar = (evento) => {
    onClick?.(evento);

    if (evento.defaultPrevented) return;

    /* Segura a navegação: sem rota, seguir o href daria 404; no caso do
       "sair", pularia a limpeza do token. O mesmo vale para Ctrl/Cmd +
       clique, que abriria a página inexistente noutra aba. */
    evento.preventDefault();
    irPara(destino, { parametros, detalhe });
  };

  if (rotaExiste(destino) && !ehAcao) {
    return (
      <NavLink to={caminho} className={className} onClick={onClick} {...resto}>
        {children}
      </NavLink>
    );
  }

  return (
    <a href={caminho} className={className} onClick={aoClicar} {...resto}>
      {children}
    </a>
  );
}
