import { caminhoDe, ROTAS_ATIVAS } from "../rotas.js";
import { useNavegacao } from "./useNavegacao.js";

/**
 * Link para um destino de `rotas.js`.
 *
 * É um `<a>` de verdade, com o caminho futuro já no `href` — e não um
 * `href="#"`. Isso importa por três motivos: o navegador mostra o destino na
 * barra de status, o leitor de tela anuncia "link" em vez de "botão", e
 * quando as rotas subirem o endereço já é o certo.
 *
 * Enquanto `ROTAS_ATIVAS` for `false`, o clique é interceptado e abre o aviso
 * de "em breve" em vez de sair para uma página que ainda não existe.
 *
 * `ref` e qualquer outra prop caem no `<a>` pelo `...resto` — no React 19 a
 * ref é uma prop comum, sem precisar de forwardRef.
 *
 * ATIVAR ROTAS: este componente vira uma linha só —
 *   return <NavLink to={caminhoDe(destino, parametros)} {...resto}>{children}</NavLink>
 * e o `onClick` some junto com o aviso.
 */
export default function LinkDestino({
  destino,
  parametros,
  detalhe,
  children,
  onClick,
  ...resto
}) {
  const { irPara } = useNavegacao();
  const caminho = caminhoDe(destino, parametros);

  const aoClicar = (evento) => {
    onClick?.(evento);

    if (ROTAS_ATIVAS || evento.defaultPrevented) return;

    /* Segura a navegação: sem rota, seguir o href daria 404. O mesmo vale
       para Ctrl/Cmd + clique, que abriria a página inexistente noutra aba. */
    evento.preventDefault();
    irPara(destino, { parametros, detalhe });
  };

  return (
    <a href={caminho} onClick={aoClicar} {...resto}>
      {children}
    </a>
  );
}
