package br.com.saudeplus.retencao;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * `saudeplus.retencao.*`: por quanto tempo guardar o que não é prontuário.
 *
 * Prontuário (consultas, resumo, desfecho), exames e financeiro não entram
 * aqui: a Resolução CFM 1.821/2007 manda guardar o prontuário por 20 anos, e
 * os registros fiscais têm prazo próprio.
 *
 * @param notificacoesLidas avisos já lidos
 * @param tokensDeSenha links de redefinição de senha, contados a partir do vencimento
 * @param auditoria registros de atividade; no mínimo 6 meses (Marco Civil, art. 15)
 */
@ConfigurationProperties("saudeplus.retencao")
public record RetencaoPropriedades(Duration notificacoesLidas, Duration tokensDeSenha, Duration auditoria) {

    static final Duration AUDITORIA_MINIMA = Duration.ofDays(180);

    public RetencaoPropriedades {
        notificacoesLidas = notificacoesLidas == null ? Duration.ofDays(180) : notificacoesLidas;
        tokensDeSenha = tokensDeSenha == null ? Duration.ofDays(30) : tokensDeSenha;
        auditoria = auditoria == null ? Duration.ofDays(5 * 365) : auditoria;
        if (auditoria.compareTo(AUDITORIA_MINIMA) < 0) {
            throw new IllegalStateException(
                    "saudeplus.retencao.auditoria precisa ser de pelo menos 180 dias (Marco Civil da Internet, art. 15).");
        }
    }
}
