/* Rolagem e foco dentro da própria tela.
   Usado pelos atalhos que não levam a outra página — o sino que desce até as
   notificações, os cartões de resumo que apontam para o painel que resumem. */

/** Respeita quem pediu menos animação nas preferências do sistema. */
function comportamento() {
  const menosMovimento =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return menosMovimento ? "auto" : "smooth";
}

/**
 * Leva a pessoa até um painel da tela.
 *
 * Rolar sozinho move só a visão de quem enxerga. Por isso o foco também vai
 * para o título do painel: quem navega por teclado ou leitor de tela chega
 * junto, e o próximo Tab continua de lá — e não do topo da página.
 *
 * @param idDoTitulo  o mesmo `titleId` passado ao <Panel>
 */
export function irAtePainel(idDoTitulo) {
  if (typeof document === "undefined") return;

  const titulo = document.getElementById(idDoTitulo);
  if (!titulo) return;

  const painel = titulo.closest("section") ?? titulo;
  painel.scrollIntoView({ behavior: comportamento(), block: "start" });
  titulo.focus({ preventScroll: true });
}
