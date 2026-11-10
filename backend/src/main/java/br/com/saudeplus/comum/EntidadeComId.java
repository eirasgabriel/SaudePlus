package br.com.saudeplus.comum;

import java.util.Objects;
import java.util.UUID;

import org.hibernate.Hibernate;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

/**
 * Id UUID gerado pela aplicação, com `equals`/`hashCode` pelo id — seguro
 * para proxies do Hibernate e para entidades ainda não salvas.
 */
@MappedSuperclass
public abstract class EntidadeComId {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    public UUID getId() {
        return id;
    }

    @Override
    public final boolean equals(Object outro) {
        if (this == outro) {
            return true;
        }
        if (outro == null || Hibernate.getClass(this) != Hibernate.getClass(outro)) {
            return false;
        }
        return id != null && Objects.equals(id, ((EntidadeComId) outro).id);
    }

    @Override
    public final int hashCode() {
        return Hibernate.getClass(this).hashCode();
    }
}
