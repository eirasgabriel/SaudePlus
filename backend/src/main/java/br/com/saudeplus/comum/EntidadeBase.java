package br.com.saudeplus.comum;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

/**
 * Base das entidades com id UUID e carimbo de criação/atualização.
 *
 * Tabelas sem `atualizado_em` estendem {@link EntidadeComId} direto.
 */
@MappedSuperclass
public abstract class EntidadeBase extends EntidadeComId {

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @PrePersist
    void aoCriar() {
        criadoEm = Instant.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = Instant.now();
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}
