package br.com.saudeplus.retencao;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Apaga, uma vez por dia, o que passou do prazo de guarda (LGPD, art. 15 e 16:
 * dado pessoal não fica além do necessário). Os prazos estão em
 * {@link RetencaoPropriedades}; o horário, em `saudeplus.retencao.cron`.
 *
 * Só toca em dados operacionais: notificações lidas, links de senha vencidos
 * e auditoria antiga. Prontuário, exames e cobranças nunca são apagados aqui.
 */
@Component
public class RetencaoDeDados {

    private static final Logger log = LoggerFactory.getLogger(RetencaoDeDados.class);

    private final JdbcTemplate jdbc;
    private final RetencaoPropriedades prazos;
    private final Clock relogio;

    public RetencaoDeDados(JdbcTemplate jdbc, RetencaoPropriedades prazos, Clock relogio) {
        this.jdbc = jdbc;
        this.prazos = prazos;
        this.relogio = relogio;
    }

    /** O que foi apagado em cada tabela. */
    public record Resultado(int notificacoes, int tokensDeSenha, int auditoria) {
    }

    @Scheduled(cron = "${saudeplus.retencao.cron:0 30 3 * * *}", zone = "${saudeplus.fuso-horario:America/Sao_Paulo}")
    @Transactional
    public Resultado executar() {
        Instant agora = relogio.instant();
        int notificacoes = jdbc.update("DELETE FROM notificacoes WHERE lida AND criada_em < ?",
                Timestamp.from(agora.minus(prazos.notificacoesLidas())));
        int tokens = jdbc.update("DELETE FROM tokens_redefinicao_senha WHERE expira_em < ?",
                Timestamp.from(agora.minus(prazos.tokensDeSenha())));
        int auditoria = jdbc.update("DELETE FROM registros_atividade WHERE criado_em < ?",
                Timestamp.from(agora.minus(prazos.auditoria())));
        if (notificacoes + tokens + auditoria > 0) {
            log.info("Retenção de dados: {} notificações lidas, {} links de senha e {} registros de auditoria apagados.",
                    notificacoes, tokens, auditoria);
        }
        return new Resultado(notificacoes, tokens, auditoria);
    }
}
