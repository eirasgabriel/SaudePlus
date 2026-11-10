package br.com.saudeplus.agenda;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BloqueioAgendaRepository extends JpaRepository<BloqueioAgenda, UUID> {

    /** Bloqueios que tocam o intervalo [de, ate). */
    @Query("""
            select b from BloqueioAgenda b
            where b.medico.id in :medicoIds and b.inicio < :ate and b.fim > :de""")
    List<BloqueioAgenda> queTocam(Collection<UUID> medicoIds, Instant de, Instant ate);

    List<BloqueioAgenda> findByMedicoIdAndFimAfterOrderByInicio(UUID medicoId, Instant depoisDe);

    Optional<BloqueioAgenda> findByIdAndMedicoId(UUID id, UUID medicoId);
}
