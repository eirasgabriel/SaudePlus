package br.com.saudeplus.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Enquanto nao ha SMTP, escreve o link no console: copie do log e cole no navegador.
 * O link vale como senha temporaria, entao este comportamento e so para desenvolvimento.
 */
@Component
public class LogEnviadorDeEmail implements EnviadorDeEmail {

	private static final Logger log = LoggerFactory.getLogger(LogEnviadorDeEmail.class);

	@Override
	public void enviarLinkDeRecuperacao(String destinatario, String nome, String link) {
		log.info("[E-MAIL SIMULADO] Recuperacao de senha para {} <{}>: {}", nome, destinatario, link);
	}
}
