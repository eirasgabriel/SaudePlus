package br.com.saudeplus.admin;

import java.lang.management.ManagementFactory;
import java.sql.DatabaseMetaData;
import java.time.Clock;
import java.time.Instant;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * "Informações do sistema" de Configurações › Geral: versão compilada, banco,
 * última migração aplicada e desde quando o servidor está no ar. Não expõe
 * endereço, usuário nem segredo de nada.
 */
@Service
public class InformacoesDoSistemaService {

    private final ObjectProvider<BuildProperties> compilacao;
    private final ObjectProvider<Flyway> flyway;
    private final JdbcTemplate jdbc;
    private final Clock relogio;

    public InformacoesDoSistemaService(ObjectProvider<BuildProperties> compilacao, ObjectProvider<Flyway> flyway,
            JdbcTemplate jdbc, Clock relogio) {
        this.compilacao = compilacao;
        this.flyway = flyway;
        this.jdbc = jdbc;
        this.relogio = relogio;
    }

    /** `versao` é nula quando o jar foi montado sem o build-info (rodando pela IDE, por exemplo). */
    public record Informacoes(String versao, Instant compiladoEm, String java, String banco, Migracao ultimaMigracao,
            String fusoHorario, Instant noArDesde) {
    }

    public record Migracao(String versao, String descricao, Instant aplicadaEm) {
    }

    public Informacoes montar() {
        BuildProperties build = compilacao.getIfAvailable();
        return new Informacoes(
                build == null ? null : build.getVersion(),
                build == null ? null : build.getTime(),
                Runtime.version().toString(),
                jdbc.execute((ConnectionCallback<String>) conexao -> {
                    DatabaseMetaData banco = conexao.getMetaData();
                    return banco.getDatabaseProductName() + " " + banco.getDatabaseProductVersion();
                }),
                ultimaMigracao(),
                relogio.getZone().getId(),
                Instant.ofEpochMilli(ManagementFactory.getRuntimeMXBean().getStartTime()));
    }

    private Migracao ultimaMigracao() {
        Flyway migracoes = flyway.getIfAvailable();
        MigrationInfo atual = migracoes == null ? null : migracoes.info().current();
        if (atual == null) {
            return null;
        }
        return new Migracao(atual.getVersion() == null ? null : atual.getVersion().getVersion(), atual.getDescription(),
                atual.getInstalledOn() == null ? null : atual.getInstalledOn().toInstant());
    }
}
