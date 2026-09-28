package br.com.saudeplus.notificacoes;

/**
 * Porta de saída de e-mail. As regras de negócio só conhecem esta interface,
 * então trocar o log por um provedor SMTP é trocar a implementação.
 */
public interface EnvioEmail {

    void enviar(String para, String assunto, String corpo);
}
