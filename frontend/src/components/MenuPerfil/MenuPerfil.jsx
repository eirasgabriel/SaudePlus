import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { cx } from "../../utils/cx.js";
import styles from "./MenuPerfil.module.css";

/**
 * Menu que abre ao clicar no nome, no canto superior direito.
 *
 * É compartilhado pelas três áreas (médico, paciente e administração), porque
 * o comportamento é o mesmo e errar acessibilidade em três cópias é fácil.
 * Cada área passa os seus próprios `itens`; o que mora aqui é só o
 * comportamento e a aparência da caixa.
 *
 * Comportamento de teclado e mouse:
 * - Esc fecha e devolve o foco ao botão que abriu;
 * - clicar fora fecha;
 * - o primeiro item recebe o foco ao abrir;
 * - Tab sai do menu naturalmente, sem prender o foco (é um menu curto, não
 *   um diálogo modal — prender aqui atrapalharia mais do que ajuda).
 *
 * Cada item de `itens`:
 *   rotulo        texto exibido (obrigatório, e é a chave da lista)
 *   icone         componente de ícone que recebe `size` e `className`
 *   href          destino; começando com "/" navega pelo router, sem recarregar
 *   onSelecionar  função chamada no clique; recebe o evento. Use
 *                 `evento.preventDefault()` para impedir a navegação — é assim
 *                 que "Sair" encerra a sessão antes de sair, e que uma tela
 *                 ainda inexistente mostra o aviso em vez de dar 404
 *   separado      desenha um traço acima do item (para isolar o "Sair")
 *   destaque      pinta o item de forma diferente (idem)
 */
export default function MenuPerfil({ aberto, aoFechar, botaoDeOrigem, id, itens = [], rotulo = "Conta" }) {
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
    <div id={id} ref={caixa} className={styles.menu} role="menu" aria-label={rotulo}>
      {itens.map((item, indice) => (
        <ItemDoMenu
          key={item.rotulo}
          item={item}
          aoFechar={aoFechar}
          referencia={indice === 0 ? primeiroItem : undefined}
        />
      ))}
    </div>
  );
}

function ItemDoMenu({ item, aoFechar, referencia }) {
  const { rotulo, icone: Icone, href, onSelecionar, separado, destaque } = item;

  const classe = cx(styles.item, separado && styles.separado, destaque && styles.sair);

  const aoClicar = (evento) => {
    onSelecionar?.(evento);
    // Fecha depois de agir: escolher uma opção sempre fecha o menu.
    aoFechar();
  };

  const conteudo = (
    <>
      {Icone && <Icone size={18} className={styles.icone} />}
      {rotulo}
    </>
  );

  /* Destino interno sem tratamento próprio: `Link` navega sem recarregar a
     página e mantém o Ctrl/Cmd + clique funcionando. */
  if (href?.startsWith("/") && !onSelecionar) {
    return (
      <Link ref={referencia} to={href} role="menuitem" className={classe} onClick={aoClicar}>
        {conteudo}
      </Link>
    );
  }

  /* Com `onSelecionar`, o item continua sendo um <a> de verdade — o href real
     no atributo, para o leitor de tela anunciar "link" e a barra de status
     mostrar o destino — mas quem decide o que acontece é a função. */
  return (
    <a ref={referencia} href={href ?? "#"} role="menuitem" className={classe} onClick={aoClicar}>
      {conteudo}
    </a>
  );
}
