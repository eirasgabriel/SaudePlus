package br.com.saudeplus.areamedico.dto;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;

/**
 * Um item da agenda do médico. `tipo` é o texto curto da lista (o motivo
 * informado ou o tipo de atendimento); `tipoAtendimento` é a categoria.
 */
public record ConsultaResposta(
        UUID id,
        String horario,
        UUID pacienteId,
        String paciente,
        String tipo,
        TipoAtendimento tipoAtendimento,
        Modalidade modalidade,
        StatusAgendamento status) {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public static ConsultaResposta de(Agendamento agendamento) {
        return new ConsultaResposta(
                agendamento.getId(),
                agendamento.getHorario().format(HORA),
                agendamento.getPaciente().getId(),
                agendamento.getPaciente().getUsuario().getNomeCompleto(),
                agendamento.descricao(),
                agendamento.getTipo(),
                agendamento.getModalidade(),
                agendamento.getStatus());
    }
}
