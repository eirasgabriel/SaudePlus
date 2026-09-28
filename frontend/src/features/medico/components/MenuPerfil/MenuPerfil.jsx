import { useEffect, useRef } from "react";

import { cx } from "../../../../utils/cx.js";
import { MENU_PERFIL } from "../../layouts/navigation.js";
import LinkDestino from "../../navegacao/LinkDestino.jsx";
import styles from "./MenuPerfil.module.css";

/**
 * Menu que abre ao clicar no nome, no canto superior direito.
 *
 * Abrir e fechar funciona hoje. Os itens são links de verdade, com o caminho
 * futuro no `href`; como as telas ainda não existem, clicar abre o aviso
 * dizendo o destino. "Ajuda" é a exceção: essa página já existe no site
 * institucional e passa a funcionar assim que as duas áreas dividirem o
 * mesmo roteador.
 *
 * Comportamento de teclado e mouse:
 * - Esc fecha e devolve o foco ao botão que abriu;
 * - clicar fora fecha;
 * - o primeiro item recebe o foco ao abrir;
 * - Tab sai do menu naturalmente, sem prender o foco (é um menu curto, não
 *   um diálogo modal — prender aqui atrapalharia mais do que ajuda).
 */
export default function MenuPerfil({ aberto, aoFechar, botaoDeOrigem, id }) {
  const caixa = useRef(null);
  const primeiroItem = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    primeiroItem.current?.focus();

    const aoTeclar = (evento) => {
      if (evento.key !== "Escape") return;
      aoFechar();
      botaoDeOrigem?.current?.focus();
    };

    const aoClicarFora = (evento) => {
      if (caixa.current?.contains(evento.target)) return;
      if (botaoDeOrigem?.current?.contains(evento.target)) return;
      aoFechar();
    };

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("mousedown", aoClicarFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("mousedown", aoClicarFora);
    };
  }, [aberto, aoFechar, botaoDeOrigem]);

  if (!aberto) return null;

  return (
    <div id={id} ref={caixa} className={styles.menu} role="menu" aria-label="Conta">
      {MENU_PERFIL.map(({ rotulo, icone: Icone, destino, separado }, indice) => (
        <LinkDestino
          key={rotulo}
          ref={indice === 0 ? primeiroItem : undefined}
          destino={destino}
          role="menuitem"
          className={cx(styles.item, separado && styles.separado, destino === "sair" && styles.sair)}
          /* Fecha o menu ao escolher. A navegação em si fica a cargo do
             LinkDestino — hoje o aviso, amanhã a rota. */
          onClick={aoFechar}
        >
          <Icone size={18} className={styles.icone} />
          {rotulo}
        </LinkDestino>
      ))}
    </div>
  );
}
