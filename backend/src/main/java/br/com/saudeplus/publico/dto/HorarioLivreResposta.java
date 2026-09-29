package br.com.saudeplus.publico.dto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import br.com.saudeplus.agenda.CalculadoraDeHorarios.HorarioLivre;
import br.com.saudeplus.agenda.Modalidade;

/** Horário que pode ser reservado. `horario` em `HH:mm`, local da unidade. */
public record HorarioLivreResposta(LocalDate data, String horario, int duracaoMin, UUID unidadeId,
        Modalidade modalidade) {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public static HorarioLivreResposta de(HorarioLivre livre) {
        return new HorarioLivreResposta(livre.data(), livre.horario().format(HORA), livre.duracaoMin(),
                livre.unidadeId(), livre.modalidade());
    }
}
