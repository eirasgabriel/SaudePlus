package br.com.saudeplus.notificacoes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Envio de verdade, por SMTP. Liga sozinho quando `spring.mail.host` está
 * configurado (variável SPRING_MAIL_HOST) e passa na frente do envio no log
 * ou desligado, em qualquer perfil.
 *
 * Falha de envio não derruba a requisição: a recuperação de senha responde
 * igual exista ou não a conta, e o convite pode ser reenviado pelo admin.
 */
@Component
@Primary
@ConditionalOnProperty(prefix = "spring.mail", name = "host")
class EnvioEmailSmtp implements EnvioEmail {

    private static final Logger log = LoggerFactory.getLogger(EnvioEmailSmtp.class);

    private final JavaMailSender correio;
    private final String remetente;

    EnvioEmailSmtp(JavaMailSender correio,
            @Value("${saudeplus.email.remetente:${spring.mail.username:}}") String remetente) {
        this.correio = correio;
        this.remetente = remetente;
    }

    @Override
    public void enviar(String para, String assunto, String corpo) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        if (!remetente.isBlank()) {
            mensagem.setFrom(remetente);
        }
        mensagem.setTo(para);
        mensagem.setSubject(assunto);
        mensagem.setText(corpo);
        try {
            correio.send(mensagem);
        } catch (MailException falha) {
            log.error("E-mail \"{}\" para {} não enviado: {}", assunto,
                    EnvioEmailDesligado.mascarar(para), falha.getMessage());
        }
    }
}
