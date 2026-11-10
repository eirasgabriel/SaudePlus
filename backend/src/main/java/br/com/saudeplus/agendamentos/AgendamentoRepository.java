package br.com.saudeplus.agendamentos;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import br.com.saudeplus.agenda.Ocupacao;

public interface AgendamentoRepository extends JpaRepository<Agendamento, UUID>, JpaSpecificationExecutor<Agendamento> {

    // ---------------------------------------------------------------- administração

    /** [ano, mês, total] por mês de consulta, no período. */
    @Query("""
            select extract(year from a.data), extract(month from a.data), count(a)
            from Agendamento a
            where a.data between :de and :ate
            group by extract(year from a.data), extract(month from a.data)""")
    List<Object[]> totaisPorMes(LocalDate de, LocalDate ate);

    /** [status, total] no período. */
    @Query("select a.status, count(a) from Agendamento a where a.data between :de and :ate group by a.status")
    List<Object[]> totaisPorStatus(LocalDate de, LocalDate ate);

    /** [tipo, total] no período, sem as canceladas. */
    @Query("""
            select a.tipo, count(a) from Agendamento a
            where a.data between :de and :ate
              and a.status <> br.com.saudeplus.agendamentos.StatusAgendamento.CANCELADA
            group by a.tipo""")
    List<Object[]> totaisPorTipo(LocalDate de, LocalDate ate);

    /** [data, tipo, status, total] por dia do período: base do calendário da administração. */
    @Query("""
            select a.data, a.tipo, a.status, count(a) from Agendamento a
            where a.data between :de and :ate
            group by a.data, a.tipo, a.status""")
    List<Object[]> totaisPorDia(LocalDate de, LocalDate ate);

    /** [unidadeId, total] no período, mais movimentadas primeiro. */
    @Query("""
            select a.unidade.id, count(a) from Agendamento a
            where a.data between :de and :ate
            group by a.unidade.id
            order by count(a) desc""")
    List<Object[]> totaisPorUnidade(LocalDate de, LocalDate ate);

    /** Os mais recentes pela data de criação da reserva. */
    @EntityGraph(attributePaths = {"paciente.usuario", "medico.usuario", "unidade", "especialidade"})
    List<Agendamento> findTop5ByOrderByCriadoEmDesc();

    @EntityGraph(attributePaths = {"paciente.usuario", "medico.usuario", "unidade", "especialidade"})
    Optional<Agendamento> findCompletoById(UUID id);

    /** Agenda de um dia do médico, com o paciente já carregado para mostrar o nome. */
    @EntityGraph(attributePaths = {"paciente", "paciente.usuario"})
    List<Agendamento> findByMedicoIdAndDataOrderByHorario(UUID medicoId, LocalDate data);

    /** Busca restrita ao médico: id de outro médico não é encontrado (404, não 403). */
    @EntityGraph(attributePaths = {"paciente", "paciente.usuario"})
    Optional<Agendamento> findByIdAndMedicoId(UUID id, UUID medicoId);

    /** Horários tomados dos médicos no período, para o cálculo de horários livres. */
    @Query("""
            select new br.com.saudeplus.agenda.Ocupacao(a.medico.id, a.data, a.horario, a.duracaoMin)
            from Agendamento a
            where a.medico.id in :medicoIds and a.data between :de and :ate and a.status in :status""")
    List<Ocupacao> ocupacoes(Collection<UUID> medicoIds, LocalDate de, LocalDate ate,
            Collection<StatusAgendamento> status);

    /** Agendamentos que ocupam horário num intervalo de datas (conferência de bloqueio). */
    @EntityGraph(attributePaths = {"paciente", "paciente.usuario"})
    List<Agendamento> findByMedicoIdAndDataBetweenAndStatusInOrderByDataAscHorarioAsc(
            UUID medicoId, LocalDate de, LocalDate ate, Collection<StatusAgendamento> status);

    /** Agendamentos mais recentes do médico: base da lista de pacientes do painel. */
    @EntityGraph(attributePaths = {"paciente", "paciente.usuario"})
    List<Agendamento> findByMedicoIdAndDataLessThanEqualOrderByDataDescHorarioDesc(
            UUID medicoId, LocalDate ate, Pageable limite);

    /** Histórico de um paciente com um médico, do mais recente para o mais antigo. */
    List<Agendamento> findByMedicoIdAndPacienteIdOrderByDataDescHorarioDesc(UUID medicoId, UUID pacienteId);

    boolean existsByMedicoIdAndPacienteId(UUID medicoId, UUID pacienteId);

    /** Todos os agendamentos de alguns pacientes com o médico (última consulta de cada um). */
    List<Agendamento> findByMedicoIdAndPacienteIdIn(UUID medicoId, Collection<UUID> pacienteIds);

    /** Consultas do paciente, com o que a tela mostra (médico, unidade, especialidade) já carregado. */
    @EntityGraph(attributePaths = {"medico.usuario", "unidade", "especialidade"})
    List<Agendamento> findByPacienteIdOrderByDataAscHorarioAsc(UUID pacienteId);

    /** Busca restrita ao paciente: consulta de outra pessoa não é encontrada (404). */
    @EntityGraph(attributePaths = {"medico.usuario", "unidade", "especialidade"})
    Optional<Agendamento> findByIdAndPacienteId(UUID id, UUID pacienteId);

    /** Consultas do paciente num dia que ainda ocupam horário (conferência de choque de horário). */
    List<Agendamento> findByPacienteIdAndDataAndStatusIn(UUID pacienteId, LocalDate data,
            Collection<StatusAgendamento> status);

    /** Com paciente e médico carregados, para montar avisos fora da transação original. */
    @EntityGraph(attributePaths = {"paciente.usuario", "medico.usuario"})
    Optional<Agendamento> findComParticipantesById(UUID id);
}
