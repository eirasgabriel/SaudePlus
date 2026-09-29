package br.com.saudeplus.agenda;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/** Horário já tomado por um agendamento que ocupa a agenda. */
public record Ocupacao(UUID medicoId, LocalDate data, LocalTime inicio, int duracaoMin) {

    public Ocupacao(UUID medicoId, LocalDate data, LocalTime inicio, short duracaoMin) {
        this(medicoId, data, inicio, (int) duracaoMin);
    }
}
