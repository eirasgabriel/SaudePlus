package br.com.saudeplus.profissionais;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {

    boolean existsByAgendamentoId(UUID agendamentoId);

    List<Avaliacao> findByAgendamentoIdIn(Collection<UUID> agendamentoIds);

    @EntityGraph(attributePaths = {"paciente", "paciente.usuario"})
    Page<Avaliacao> findByMedicoIdOrderByCriadoEmDesc(UUID medicoId, Pageable pagina);
}
