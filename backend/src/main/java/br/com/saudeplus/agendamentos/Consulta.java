package br.com.saudeplus.agendamentos;

import java.time.LocalDate;
import java.time.LocalTime;

/** Consulta agendada entre um profissional e um paciente. */
public record Consulta(
        String id,
        String medicoId,
        String pacienteId,
        LocalDate data,
        LocalTime horario,
        String tipo,
        StatusConsulta status) {

    /** Devolve uma cópia com outro status — o record em si é imutável. */
    public Consulta comStatus(StatusConsulta novoStatus) {
        return new Consulta(id, medicoId, pacienteId, data, horario, tipo, novoStatus);
    }
}
