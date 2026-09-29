package br.com.saudeplus.exames;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ExameRepository extends JpaRepository<Exame, UUID> {

    /** Pendentes do médico, prazo mais próximo primeiro; sem prazo vão para o fim. */
    @EntityGraph(attributePaths = {"tipo", "paciente", "paciente.usuario"})
    @Query("""
            select e from Exame e
            where e.medicoSolicitante.id = :medicoId and e.status in :status
            order by e.prazo asc nulls last, e.criadoEm asc""")
    List<Exame> pendentesDoMedico(UUID medicoId, Collection<StatusExame> status);

    @EntityGraph(attributePaths = "tipo")
    List<Exame> findByPacienteIdAndMedicoSolicitanteIdOrderByCriadoEmDesc(UUID pacienteId, UUID medicoId);

    @EntityGraph(attributePaths = {"tipo", "medicoSolicitante.usuario", "unidade"})
    List<Exame> findByPacienteIdOrderByCriadoEmDesc(UUID pacienteId);

    /** Restrito ao médico que pediu: exame de outro médico não é encontrado (404). */
    @EntityGraph(attributePaths = {"tipo", "paciente.usuario"})
    Optional<Exame> findByIdAndMedicoSolicitanteId(UUID id, UUID medicoId);

    /** Como o anterior, com a unidade da coleta, para a tela de detalhe. */
    @EntityGraph(attributePaths = {"tipo", "paciente.usuario", "unidade"})
    Optional<Exame> findDetalheByIdAndMedicoSolicitanteId(UUID id, UUID medicoId);

    /** Exames que o médico pediu, nos status informados, paginados. */
    @EntityGraph(attributePaths = {"tipo", "paciente.usuario"})
    Page<Exame> findByMedicoSolicitanteIdAndStatusIn(UUID medicoId, Collection<StatusExame> status, Pageable pagina);

    /** Exames pedidos numa consulta. */
    @EntityGraph(attributePaths = "tipo")
    List<Exame> findByAgendamentoOrigemIdOrderByCriadoEmAsc(UUID agendamentoId);

    /** Com paciente, médico e tipo carregados, para avisos e para a fila da clínica. */
    @EntityGraph(attributePaths = {"tipo", "paciente.usuario", "medicoSolicitante.usuario", "unidade"})
    Optional<Exame> findCompletoById(UUID id);

    /** Fila da clínica: por status (todos, se nulo), pedidos mais antigos primeiro. */
    @EntityGraph(attributePaths = {"tipo", "paciente.usuario", "medicoSolicitante.usuario", "unidade"})
    @Query("""
            select e from Exame e
            where (:status is null or e.status = :status)
            order by e.criadoEm asc""")
    List<Exame> fila(StatusExame status);

    long countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(Instant de, Instant ate);

    /** Coletas marcadas no intervalo, para o calendário da administração. */
    @Query("select e.dataHora from Exame e where e.dataHora >= :de and e.dataHora < :ate")
    List<Instant> coletasEntre(Instant de, Instant ate);

    /** Restrito ao paciente: exame de outra pessoa não é encontrado (404). */
    @EntityGraph(attributePaths = {"tipo", "medicoSolicitante.usuario", "unidade"})
    Optional<Exame> findByIdAndPacienteId(UUID id, UUID pacienteId);
}
