package br.com.saudeplus.notificacoes;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import br.com.saudeplus.exames.EventosDeExame.ExameAgendado;
import br.com.saudeplus.exames.EventosDeExame.ExameSolicitado;
import br.com.saudeplus.exames.EventosDeExame.ResultadoLiberado;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.usuarios.Usuario;

/**
 * Avisos do ciclo de exame: o paciente sabe do pedido, da coleta marcada e do
 * resultado; o médico que pediu sabe do resultado. Depois do commit, em
 * transação própria, como os avisos de agendamento.
 */
@Component
class NotificacoesDeExame {

    private static final DateTimeFormatter DIA_E_HORA = DateTimeFormatter.ofPattern("dd/MM 'às' HH:mm");
    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("dd/MM");

    private final ExameRepository exames;
    private final NotificacaoService notificacoes;
    private final Clock relogio;

    NotificacoesDeExame(ExameRepository exames, NotificacaoService notificacoes, Clock relogio) {
        this.exames = exames;
        this.notificacoes = notificacoes;
        this.relogio = relogio;
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoSolicitar(ExameSolicitado evento) {
        exames.findCompletoById(evento.exameId()).ifPresent(exame -> {
            String detalhe = "%s – pedido por %s".formatted(exame.getTipo().getNome(),
                    exame.getMedicoSolicitante().getUsuario().getNomeCompleto());
            if (exame.getTipo().getPreparo() != null) {
                detalhe += ". Preparo: " + exame.getTipo().getPreparo();
            }
            notificacoes.notificar(paciente(exame), TipoNotificacao.SISTEMA, "Novo exame solicitado", limitar(detalhe));
        });
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoAgendar(ExameAgendado evento) {
        exames.findCompletoById(evento.exameId()).ifPresent(exame -> notificacoes.notificar(paciente(exame),
                TipoNotificacao.AGENDAMENTO, "Coleta de exame agendada",
                "%s – %s, %s".formatted(exame.getTipo().getNome(),
                        LocalDateTime.ofInstant(exame.getDataHora(), relogio.getZone()).format(DIA_E_HORA),
                        exame.getUnidade().getNome())));
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void aoLiberar(ResultadoLiberado evento) {
        exames.findCompletoById(evento.exameId()).ifPresent(exame -> {
            notificacoes.notificar(paciente(exame), TipoNotificacao.RESULTADO, "Resultado de exame disponível",
                    "%s – liberado em %s".formatted(exame.getTipo().getNome(),
                            LocalDateTime.ofInstant(exame.getResultadoLiberadoEm(), relogio.getZone()).format(DIA)));
            if (exame.getMedicoSolicitante() != null) {
                notificacoes.notificar(exame.getMedicoSolicitante().getUsuario(), TipoNotificacao.RESULTADO,
                        "Resultado de exame disponível", "%s – %s".formatted(
                                exame.getPaciente().getUsuario().getNomeCompleto(), exame.getTipo().getNome()));
            }
        });
    }

    private static Usuario paciente(Exame exame) {
        return exame.getPaciente().getUsuario();
    }

    /** A coluna `detalhe` tem 500 caracteres. */
    private static String limitar(String texto) {
        return texto.length() <= 500 ? texto : texto.substring(0, 497) + "...";
    }
}
