package br.com.saudeplus.financeiro;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface TransacaoRepository extends JpaRepository<Transacao, UUID>, JpaSpecificationExecutor<Transacao> {

    List<Transacao> findByAgendamentoId(UUID agendamentoId);

    @EntityGraph(attributePaths = "paciente.usuario")
    Optional<Transacao> findCompletaById(UUID id);

    List<Transacao> findByPacienteIdOrderByDataHoraDesc(UUID pacienteId);

    /** Pagamentos recebidos no intervalo [de, ate), pela data do pagamento. */
    @Query("""
            select t from Transacao t
            where t.status = br.com.saudeplus.financeiro.StatusTransacao.PAGO and t.pagoEm >= :de and t.pagoEm < :ate""")
    List<Transacao> pagasEntre(Instant de, Instant ate);

    /** Cobranças lançadas no intervalo [de, ate). */
    @Query("select t from Transacao t where t.dataHora >= :de and t.dataHora < :ate")
    List<Transacao> lancadasEntre(Instant de, Instant ate);

    /** Estornos feitos no intervalo [de, ate). */
    @Query("""
            select t from Transacao t
            where t.status = br.com.saudeplus.financeiro.StatusTransacao.ESTORNADO
              and t.estornadoEm >= :de and t.estornadoEm < :ate""")
    List<Transacao> estornadasEntre(Instant de, Instant ate);

    /** Tudo o que está em aberto, de qualquer data. */
    List<Transacao> findByStatus(StatusTransacao status);
}
