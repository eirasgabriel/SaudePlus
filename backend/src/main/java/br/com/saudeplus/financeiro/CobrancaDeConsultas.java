package br.com.saudeplus.financeiro;

import java.math.BigDecimal;
import java.time.Clock;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoCancelado;
import br.com.saudeplus.agendamentos.AgendamentoConfirmado;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.profissionais.Medico;

/**
 * Cobrança automática das consultas:
 * - confirmada → cobrança pendente com o valor da consulta do médico (sem
 *   valor cadastrado, não há cobrança: atendimento gratuito/SUS);
 * - paciente com convênio aceito pelo médico → a cobrança já nasce "convênio";
 * - cancelada → a cobrança pendente é anulada (estornada sem ter sido paga);
 *   a já paga fica, e a devolução é decisão da administração.
 *
 * Roda depois do commit da confirmação/cancelamento, em transação própria.
 */
@Component
class CobrancaDeConsultas {

    private final AgendamentoRepository agendamentos;
    private final TransacaoRepository transacoes;
    private final Clock relogio;

    CobrancaDeConsultas(AgendamentoRepository agendamentos, TransacaoRepository transacoes, Clock relogio) {
        this.agendamentos = agendamentos;
        this.transacoes = transacoes;
        this.relogio = relogio;
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoConfirmar(AgendamentoConfirmado evento) {
        agendamentos.findComParticipantesById(evento.agendamentoId()).ifPresent(this::cobrar);
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoCancelar(AgendamentoCancelado evento) {
        transacoes.findByAgendamentoId(evento.agendamentoId()).stream()
                .filter(t -> t.getStatus() == StatusTransacao.PENDENTE)
                .forEach(t -> t.estornar(relogio.instant()));
    }

    private void cobrar(Agendamento agendamento) {
        boolean jaCobrada = transacoes.findByAgendamentoId(agendamento.getId()).stream()
                .anyMatch(t -> t.getStatus() != StatusTransacao.ESTORNADO);
        Medico medico = agendamento.getMedico();
        BigDecimal valor = medico.getValorConsulta();
        if (jaCobrada || valor == null) {
            return;
        }
        var convenioDoPaciente = agendamento.getPaciente().getConvenioId();
        boolean coberta = convenioDoPaciente != null
                && medico.conveniosOrdenados().stream().anyMatch(c -> c.getId().equals(convenioDoPaciente));
        String descricao = "%s – %s – %s".formatted(agendamento.getTipo().rotulo(), agendamento.getEspecialidade().getNome(),
                medico.getUsuario().getNomeCompleto());
        transacoes.save(Transacao.daConsulta(agendamento.getPaciente(), agendamento.getId(),
                descricao.length() > 200 ? descricao.substring(0, 200) : descricao,
                valor, coberta ? FormaPagamento.CONVENIO : null, relogio.instant()));
    }
}
