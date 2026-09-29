package br.com.saudeplus.areamedico.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.exames.StatusExame;

/**
 * Ficha do paciente vista pelo médico: só o histórico e os exames que
 * envolvem este médico.
 */
public record PacienteDetalheResposta(
        UUID id,
        String nome,
        String iniciais,
        Integer idade,
        LocalDate dataNascimento,
        String telefone,
        String email,
        List<Consulta> historico,
        List<Exame> exames) {

    public record Consulta(UUID id, LocalDate data, String horario, TipoAtendimento tipo, String descricao,
            StatusAgendamento status, String resumo, String desfecho) {
    }

    public record Exame(UUID id, String nome, StatusExame status, LocalDate prazo) {
    }
}
