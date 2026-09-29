package br.com.saudeplus.areapaciente.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import br.com.saudeplus.areapaciente.dto.ConsultaDoPacienteResposta.Local;
import br.com.saudeplus.exames.StatusExame;

/** Respostas da área do paciente, além da consulta. */
public final class RespostasDoPaciente {

    private RespostasDoPaciente() {
    }

    /** Tela inicial: quem é, próximas consultas, onde será a próxima e avisos não lidos. */
    public record Painel(Paciente paciente, List<ConsultaDoPacienteResposta> proximasConsultas, Local unidade,
            long notificacoesNaoLidas) {
    }

    public record Paciente(UUID id, String nome, String fotoUrl, String iniciais) {
    }

    /**
     * Atendimento realizado.
     *
     * @param avaliacao nota que o paciente deu (1 a 5), ou nula se ainda não avaliou
     */
    public record Atendimento(UUID id, LocalDateTime inicio, String especialidade, String medico, String unidade,
            String resumo, String desfecho, Integer avaliacao) {
    }

    /**
     * Exame do paciente. `preparo` são as orientações do tipo de exame.
     *
     * @param resultadoDisponivel o resultado já foi liberado
     */
    public record Exame(UUID id, String nome, String categoria, String preparo, StatusExame status, Instant dataHora,
            LocalDate prazo, String medico, String unidade, boolean resultadoDisponivel) {
    }

    public record AvaliacaoRegistrada(UUID agendamentoId, int nota, String comentario) {
    }
}
