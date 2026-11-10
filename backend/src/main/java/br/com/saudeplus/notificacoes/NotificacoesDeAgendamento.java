package br.com.saudeplus.notificacoes;

import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoCancelado;
import br.com.saudeplus.agendamentos.AgendamentoCriado;
import br.com.saudeplus.agendamentos.AgendamentoRemarcado;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.usuarios.Usuario;

/**
 * Transforma eventos de agendamento em notificações para a outra parte:
 * o que o paciente faz avisa o médico, e o que o médico (ou a clínica) faz
 * avisa o paciente. Roda depois do commit, numa transação própria: se a
 * gravação da notificação falhar, a operação original continua valendo.
 */
@Component
class NotificacoesDeAgendamento {

    private static final DateTimeFormatter DIA_E_HORA = DateTimeFormatter.ofPattern("dd/MM 'às' HH:mm");

    private final AgendamentoRepository agendamentos;
    private final NotificacaoService notificacoes;

    NotificacoesDeAgendamento(AgendamentoRepository agendamentos, NotificacaoService notificacoes) {
        this.agendamentos = agendamentos;
        this.notificacoes = notificacoes;
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoCriar(AgendamentoCriado evento) {
        agendamentos.findComParticipantesById(evento.agendamentoId()).ifPresent(a -> notificacoes.notificar(
                medico(a), TipoNotificacao.AGENDAMENTO, "Novo agendamento",
                "%s – %s".formatted(nomeDoPaciente(a), a.inicio().format(DIA_E_HORA))));
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoRemarcar(AgendamentoRemarcado evento) {
        agendamentos.findComParticipantesById(evento.agendamentoId()).ifPresent(a -> notificacoes.notificar(
                medico(a), TipoNotificacao.AGENDAMENTO, "Consulta remarcada",
                "%s – de %s para %s".formatted(nomeDoPaciente(a), evento.inicioAnterior().format(DIA_E_HORA),
                        a.inicio().format(DIA_E_HORA))));
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoCancelar(AgendamentoCancelado evento) {
        agendamentos.findComParticipantesById(evento.agendamentoId()).ifPresent(this::avisarCancelamento);
    }

    /** Quem cancelou não recebe aviso; a outra parte recebe. */
    private void avisarCancelamento(Agendamento agendamento) {
        Usuario paciente = agendamento.getPaciente().getUsuario();
        boolean pacienteCancelou = agendamento.getCanceladoPor() != null
                && agendamento.getCanceladoPor().getId().equals(paciente.getId());
        String quando = agendamento.inicio().format(DIA_E_HORA);
        if (pacienteCancelou) {
            notificacoes.notificar(medico(agendamento), TipoNotificacao.CANCELAMENTO, "Consulta cancelada pelo paciente",
                    "%s – %s".formatted(paciente.getNomeCompleto(), quando));
            return;
        }
        String detalhe = "%s – %s".formatted(agendamento.getMedico().getUsuario().getNomeCompleto(), quando);
        if (agendamento.getMotivoCancelamento() != null) {
            detalhe += ". " + agendamento.getMotivoCancelamento();
        }
        notificacoes.notificar(paciente, TipoNotificacao.CANCELAMENTO, "Consulta cancelada", detalhe);
    }

    private static Usuario medico(Agendamento agendamento) {
        return agendamento.getMedico().getUsuario();
    }

    private static String nomeDoPaciente(Agendamento agendamento) {
        return agendamento.getPaciente().getUsuario().getNomeCompleto();
    }
}
