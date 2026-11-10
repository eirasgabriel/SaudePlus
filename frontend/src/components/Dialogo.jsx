import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import estilos from "./ModalAgendamento.module.css";

/**
 * Janela modal com o visual do modal de agendamento: portal no `<body>`,
 * fecha com Esc e com clique no fundo, e leva o foco para dentro ao abrir.
 *
 * O conteúdo decide o resto (formulário, lista, confirmação). Para os
 * formulários ficarem iguais em todo lugar, use as classes (`formulario`,
 * `campo`, `rotulo`, `input`, `acoes`, `botaoPrimario`...) do mesmo
 * `ModalAgendamento.module.css`.
 */
export default function Dialogo({ aberto, aoFechar, titulo, descricao, largura = 520, children }) {
  const id = `dlg-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const caixa = useRef(null);
  // Guardado em ref: um `aoFechar` recriado pelo pai não pode reiniciar o
  // efeito abaixo (ele devolveria o foco para fora no meio do preenchimento).
  const fechar = useRef(aoFechar);
  useEffect(() => {
    fechar.current = aoFechar;
  });

  useEffect(() => {
    if (!aberto) return undefined;
    const anterior = document.activeElement;
    const foco = window.setTimeout(() => {
      const primeiro = caixa.current?.querySelector("input, select, textarea, button:not([data-fechar])");
      (primeiro ?? caixa.current)?.focus();
    }, 0);
    const aoTeclar = (evento) => {
      if (evento.key === "Escape") fechar.current?.();
      if (evento.key !== "Tab") return;
      const controles = [...(caixa.current?.querySelectorAll('*') ?? [])].filter((elemento) =>
        elemento.matches('a[href], button, input, select, textarea, [tabindex="0"]') &&
        !elemento.disabled && !elemento.hidden && elemento.type !== "hidden" && elemento.tabIndex >= 0,
      );
      const primeiro = controles[0];
      const ultimo = controles.at(-1);
      if (!primeiro) {
        evento.preventDefault();
        caixa.current?.focus();
      } else if (evento.shiftKey && (document.activeElement === primeiro || !controles.includes(document.activeElement))) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && (document.activeElement === ultimo || !controles.includes(document.activeElement))) {
        evento.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      window.clearTimeout(foco);
      document.removeEventListener("keydown", aoTeclar);
      // Devolve o foco a quem abriu, para o teclado não se perder na página.
      if (anterior instanceof HTMLElement) anterior.focus();
    };
  }, [aberto]);

  if (!aberto) return null;

  return createPortal(
    <div
      className={estilos.fundo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar?.();
      }}
    >
      <div
        ref={caixa}
        className={estilos.dialogo}
        style={{ maxWidth: largura }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={descricao ? `${id}-descricao` : undefined}
        tabIndex={-1}
      >
        <header className={estilos.cabecalho}>
          <div className={estilos.textoCabecalho}>
            <h2 id={`${id}-titulo`} className={estilos.titulo}>{titulo}</h2>
            {descricao && <p id={`${id}-descricao`} className={estilos.descricao}>{descricao}</p>}
          </div>
          <button type="button" data-fechar className={estilos.botaoFechar} onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}
