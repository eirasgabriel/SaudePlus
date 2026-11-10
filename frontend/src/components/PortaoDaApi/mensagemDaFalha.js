/**
 * Texto da falha para a pessoa: sem resposta (rede, timeout) ou servidor fora
 * do ar (5xx) viram uma frase simples; outros erros usam a mensagem da API.
 */
export function mensagemDaFalha(erro) {
  if (!erro || erro.offline || erro.status >= 500) {
    return "O servidor não respondeu. Verifique a conexão e tente de novo em instantes.";
  }
  return erro.corpo?.mensagem ?? erro.message ?? "Algo deu errado. Tente de novo em instantes.";
}
