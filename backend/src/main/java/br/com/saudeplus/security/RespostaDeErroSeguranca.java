package br.com.saudeplus.security;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Escreve o corpo de erro padrao (401/403) direto na resposta.
 *
 * Esses erros nascem nos filtros de seguranca, antes do MVC, entao o
 * GlobalExceptionHandler nao os alcanca.
 */
final class RespostaDeErroSeguranca {

	private RespostaDeErroSeguranca() {
	}

	static void escrever(HttpServletResponse resposta, int status, String erro, String mensagem)
			throws IOException {
		resposta.setStatus(status);
		resposta.setContentType("application/json;charset=UTF-8");
		String json = "{\"timestamp\":\"" + Instant.now() + "\",\"status\":" + status
				+ ",\"erro\":\"" + escapar(erro) + "\",\"mensagem\":\"" + escapar(mensagem) + "\"}";
		resposta.getOutputStream().write(json.getBytes(StandardCharsets.UTF_8));
	}

	private static String escapar(String texto) {
		return texto.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
	}
}
