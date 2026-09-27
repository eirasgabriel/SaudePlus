package br.com.saudeplus.agendamentos.dto;

import java.time.format.DateTimeFormatter;

import br.com.saudeplus.agendamentos.Consulta;
import br.com.saudeplus.agendamentos.StatusConsulta;

/**
 * Consulta como a linha da agenda precisa dela: horário já formatado em
 * HH:mm e o nome do paciente resolvido, para o front-end não ter de cruzar
 * duas listas só para desenhar a lista.
 */
public record ConsultaResposta(
        String id,
        String horario,
        String pacienteId,
        String paciente,
        String tipo,
        StatusConsulta status) {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public static ConsultaResposta de(Consulta consulta, String nomeDoPaciente) {
        return new ConsultaResposta(
                consulta.id(),
                consulta.horario().format(HORA),
                consulta.pacienteId(),
                nomeDoPaciente,
                consulta.tipo(),
                consulta.status());
    }
}
