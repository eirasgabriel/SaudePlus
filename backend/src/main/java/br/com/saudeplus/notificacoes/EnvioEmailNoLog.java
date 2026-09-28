package br.com.saudeplus.notificacoes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Enquanto não há SMTP, o "e-mail" vai para o console: a equipe copia o link
 * de recuperação do log e cola no navegador para testar o fluxo.
 */
@Component
class EnvioEmailNoLog implements EnvioEmail {

    private static final Logger log = LoggerFactory.getLogger(EnvioEmailNoLog.class);

    @Override
    public void enviar(String para, String assunto, String corpo) {
        log.info("""

                ===== E-mail (não enviado: sem SMTP configurado) =====
                Para: {}
                Assunto: {}

                {}
                ======================================================""", para, assunto, corpo);
    }
}
