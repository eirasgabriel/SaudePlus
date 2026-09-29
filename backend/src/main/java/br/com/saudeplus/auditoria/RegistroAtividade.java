package br.com.saudeplus.auditoria;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.ColumnTransformer;

import br.com.saudeplus.comum.EntidadeComId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Uma ação registrada: quem, o quê, sobre qual registro, de onde e quando. */
@Entity
@Table(name = "registros_atividade")
public class RegistroAtividade extends EntidadeComId {

    /** Sem associação de propósito: o registro sobrevive à conta (FK com ON DELETE SET NULL). */
    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(nullable = false, length = 60)
    private String acao;

    @Column(length = 40)
    private String entidade;

    @Column(name = "entidade_id")
    private UUID entidadeId;

    @Column(columnDefinition = "jsonb")
    @ColumnTransformer(write = "?::jsonb")
    private String detalhe;

    @Column(length = 45)
    private String ip;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected RegistroAtividade() {
    }

    RegistroAtividade(UUID usuarioId, String acao, String entidade, UUID entidadeId, String detalhe, String ip,
            Instant criadoEm) {
        this.usuarioId = usuarioId;
        this.acao = acao;
        this.entidade = entidade;
        this.entidadeId = entidadeId;
        this.detalhe = detalhe;
        this.ip = ip;
        this.criadoEm = criadoEm;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public String getAcao() {
        return acao;
    }

    public String getEntidade() {
        return entidade;
    }

    public UUID getEntidadeId() {
        return entidadeId;
    }

    public String getDetalhe() {
        return detalhe;
    }

    public String getIp() {
        return ip;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
