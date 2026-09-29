package br.com.saudeplus.auth;

/**
 * Porta de saida para e-mails. Trocar a implementacao (SMTP, SES, SendGrid...)
 * nao exige mexer nas regras de negocio.
 */
public interface EnviadorDeEmail {

	void enviarLinkDeRecuperacao(String destinatario, String nome, String link);
}
