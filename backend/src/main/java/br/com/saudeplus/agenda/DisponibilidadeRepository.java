package br.com.saudeplus.agenda;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DisponibilidadeRepository extends JpaRepository<Disponibilidade, UUID> {

    /** Modalidades oferecidas por cada médico da lista, numa consulta só. */
    @Query("""
            select distinct new br.com.saudeplus.agenda.ModalidadeDoMedico(d.medico.id, d.modalidade)
            from Disponibilidade d
            where d.medico.id in :medicoIds""")
    List<ModalidadeDoMedico> modalidadesDos(Collection<UUID> medicoIds);

    /** Janelas dos médicos, com a unidade carregada: entrada do cálculo de horários. */
    @EntityGraph(attributePaths = "unidade")
    List<Disponibilidade> findByMedicoIdIn(Collection<UUID> medicoIds);

    @EntityGraph(attributePaths = "unidade")
    List<Disponibilidade> findByMedicoIdOrderByDiaSemanaAscInicioAsc(UUID medicoId);

    Optional<Disponibilidade> findByIdAndMedicoId(UUID id, UUID medicoId);
}
