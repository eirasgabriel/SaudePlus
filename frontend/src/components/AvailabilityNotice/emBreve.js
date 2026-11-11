/**
 * Abre o aviso "Esta funcionalidade estará disponível em breve" de qualquer
 * tela, sem precisar receber uma função do App por props.
 *
 * O App escuta o evento e mostra o mesmo diálogo usado no site público.
 */
export const EVENTO_EM_BREVE = "saudeplus:em-breve";

export function avisarEmBreve(titulo, detalhe = "") {
  window.dispatchEvent(new CustomEvent(EVENTO_EM_BREVE, { detail: { titulo, detalhe } }));
}
