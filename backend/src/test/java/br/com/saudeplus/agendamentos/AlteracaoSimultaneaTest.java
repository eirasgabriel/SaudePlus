package br.com.saudeplus.agendamentos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.transaction.support.TransactionTemplate;

import br.com.saudeplus.Cenarios;
import br.com.saudeplus.TesteDeIntegracao;
import br.com.saudeplus.profissionais.Medico;

/**
 * O paciente abre a consulta pendente, a clínica confirma, e o paciente tenta
 * cancelar a partir do que tinha lido: sem a versão, o cancelamento
 * sobrescreveria a confirmação sem ninguém perceber.
 */
@TesteDeIntegracao
class AlteracaoSimultaneaTest {

    @Autowired
    private ApplicationContext contexto;

    @Autowired
    private AgendamentoRepository agendamentos;

    @Autowired
    private TransactionTemplate transacao;

    @Test
    void segundaAlteracaoAPartirDaVersaoVelhaFalhaENaoSobrescreve() {
        Cenarios cenarios = new Cenarios(contexto);
        Medico medico = cenarios.medico();
        UUID id = cenarios.agendamento(medico, cenarios.paciente("Paciente Concorrente", null),
                LocalDate.now().plusDays(10), "09:00", StatusAgendamento.PENDENTE).getId();

        Agendamento lidoPeloPaciente = transacao.execute(t -> agendamentos.findById(id).orElseThrow());
        transacao.executeWithoutResult(t ->
                agendamentos.findById(id).orElseThrow().mudarStatus(StatusAgendamento.CONFIRMADA));

        assertThatThrownBy(() -> transacao.executeWithoutResult(t -> {
            lidoPeloPaciente.mudarStatus(StatusAgendamento.CANCELADA);
            agendamentos.save(lidoPeloPaciente);
        })).isInstanceOf(OptimisticLockingFailureException.class);

        assertThat(agendamentos.findById(id).orElseThrow().getStatus()).isEqualTo(StatusAgendamento.CONFIRMADA);
    }
}
