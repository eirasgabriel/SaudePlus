package br.com.saudeplus.areamedico.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Corpos de requisição da área do médico. */
public final class RequisicoesDoMedico {

    private RequisicoesDoMedico() {
    }

    /** `motivo` só é usado quando o novo status é `cancelada`. */
    public record AtualizarStatus(
            @NotNull(message = "Informe o novo status da consulta.") StatusAgendamento status,
            @Size(max = 300, message = "O motivo deve ter até 300 caracteres") String motivo) {
    }

    public record RegistrarAtendimento(
            @NotBlank(message = "Descreva o atendimento")
            @Size(max = 5000, message = "O resumo deve ter até 5000 caracteres")
            String resumo,

            @Size(max = 2000, message = "O desfecho deve ter até 2000 caracteres")
            String desfecho) {
    }

    /** Janela semanal. `diaSemana` segue a ISO: 1 = segunda, 7 = domingo. */
    public record SalvarDisponibilidade(
            @NotNull(message = "Informe a unidade") UUID unidadeId,
            @NotNull(message = "Informe o dia da semana") @Min(value = 1, message = "Dia da semana vai de 1 a 7")
            @Max(value = 7, message = "Dia da semana vai de 1 a 7") Integer diaSemana,
            @NotNull(message = "Informe o início") LocalTime inicio,
            @NotNull(message = "Informe o fim") LocalTime fim,
            @NotNull(message = "Informe a duração") @Min(value = 5, message = "Duração mínima de 5 minutos")
            @Max(value = 240, message = "Duração máxima de 240 minutos") Integer duracaoMin,
            @NotNull(message = "Informe a modalidade") Modalidade modalidade) {
    }

    /**
     * Pedido de exame. `prazo` é a data-limite para o resultado (opcional);
     * `agendamentoOrigemId`, a consulta em que o exame foi pedido (opcional).
     */
    public record SolicitarExame(
            @NotNull(message = "Informe o paciente.") UUID pacienteId,
            @NotNull(message = "Escolha o exame.") UUID tipoExameId,
            LocalDate prazo,
            UUID agendamentoOrigemId) {
    }

    /** Horários locais da agenda (fuso de negócio), no formato `2026-10-01T08:00`. */
    public record CriarBloqueio(
            @NotNull(message = "Informe o início") LocalDateTime inicio,
            @NotNull(message = "Informe o fim") LocalDateTime fim,
            @Size(max = 200, message = "O motivo deve ter até 200 caracteres") String motivo) {
    }
}
