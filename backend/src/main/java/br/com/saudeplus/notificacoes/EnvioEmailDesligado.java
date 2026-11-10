package br.com.saudeplus.notificacoes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Fora de dev e test, sem SMTP configurado: o e-mail não sai e o log registra
 * só o assunto e o destinatário mascarado. O corpo nunca vai para o log, porque
 * traz links de redefinição de senha e de convite (quem lê o log entraria na
 * conta). Para enviar de verdade, implemente {@link EnvioEmail} com um provedor.
 */
@Component
@Profile("!dev & !test")
class EnvioEmailDesligado implements EnvioEmail {

    private static final Logger log = LoggerFactory.getLogger(EnvioEmailDesligado.class);

    @Override
    public void enviar(String para, String assunto, String corpo) {
        log.warn("E-mail \"{}\" para {} não enviado: não há provedor de e-mail configurado.", assunto, mascarar(para));
    }

    /** "maria.souza@exemplo.com" → "m***@exemplo.com": o suficiente para suporte, sem expor o endereço. */
    static String mascarar(String email) {
        if (email == null) {
            return "(sem destinatário)";
        }
        int arroba = email.indexOf('@');
        return arroba <= 0 ? "***" : email.charAt(0) + "***" + email.substring(arroba);
    }
}
