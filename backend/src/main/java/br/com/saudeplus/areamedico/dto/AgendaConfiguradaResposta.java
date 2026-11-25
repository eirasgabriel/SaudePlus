package br.com.saudeplus.areamedico.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import br.com.saudeplus.agenda.BloqueioAgenda;
import br.com.saudeplus.agenda.Disponibilidade;
import br.com.saudeplus.agenda.Modalidade;

/** Respostas da configuração de agenda: janelas de atendimento e bloqueios. */
public final class AgendaConfiguradaResposta {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    private AgendaConfiguradaResposta() {
    }

    public record UnidadeResumo(UUID id, String nome) {
    }

    /**
     * Janela de atendimento. `data` nas janelas por dia; `diaSemana` (ISO,
     * 1 = segunda) nas semanais. Exatamente um dos dois vem preenchido.
     */
    public record DisponibilidadeResposta(UUID id, UnidadeResumo unidade, LocalDate data, Integer diaSemana,
            String inicio, String fim, int duracaoMin, Modalidade modalidade) {

        public static DisponibilidadeResposta de(Disponibilidade disponibilidade) {
            return new DisponibilidadeResposta(
                    disponibilidade.getId(),
                    new UnidadeResumo(disponibilidade.getUnidade().getId(), disponibilidade.getUnidade().getNome()),
                    disponibilidade.getData(),
                    disponibilidade.getDiaSemana() == null ? null : disponibilidade.getDiaSemana().getValue(),
                    disponibilidade.getInicio().format(HORA),
                    disponibilidade.getFim().format(HORA),
                    disponibilidade.getDuracaoMin(),
                    disponibilidade.getModalidade());
        }
    }

    /**
     * @param inicio horário local da agenda
     * @param inicioInstante o mesmo momento em UTC
     * @param agendamentosCancelados quantas consultas o bloqueio cancelou (só na criação)
     */
    public record BloqueioResposta(UUID id, LocalDateTime inicio, LocalDateTime fim, Instant inicioInstante,
            Instant fimInstante, String motivo, int agendamentosCancelados) {

        public static BloqueioResposta de(BloqueioAgenda bloqueio, ZoneId fuso, int cancelados) {
            return new BloqueioResposta(
                    bloqueio.getId(),
                    LocalDateTime.ofInstant(bloqueio.getInicio(), fuso),
                    LocalDateTime.ofInstant(bloqueio.getFim(), fuso),
                    bloqueio.getInicio(),
                    bloqueio.getFim(),
                    bloqueio.getMotivo(),
                    cancelados);
        }
    }
}
