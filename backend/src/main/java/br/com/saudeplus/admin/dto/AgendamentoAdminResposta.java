package br.com.saudeplus.admin.dto;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;

/** Agendamento na visão da administração: quem, com quem, onde e quando. */
public record AgendamentoAdminResposta(
        UUID id,
        LocalDate data,
        String horario,
        Pessoa paciente,
        String especialidade,
        Profissional medico,
        Local unidade,
        TipoAtendimento tipo,
        Modalidade modalidade,
        StatusAgendamento status,
        String descricao) {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public record Pessoa(UUID id, String nome, String cpf, String fotoUrl) {
    }

    public record Profissional(UUID id, String nome, String crm) {
    }

    public record Local(UUID id, String nome, String bairro) {
    }

    public static AgendamentoAdminResposta de(Agendamento a) {
        var paciente = a.getPaciente().getUsuario();
        var medico = a.getMedico();
        return new AgendamentoAdminResposta(
                a.getId(),
                a.getData(),
                a.getHorario().format(HORA),
                new Pessoa(a.getPaciente().getId(), paciente.getNomeCompleto(), paciente.getCpf(), paciente.getFotoUrl()),
                a.getEspecialidade().getNome(),
                new Profissional(medico.getId(), medico.getUsuario().getNomeCompleto(),
                        "CRM %s-%s".formatted(medico.getCrm(), medico.getCrmUf())),
                new Local(a.getUnidade().getId(), a.getUnidade().getNome(), a.getUnidade().getBairro()),
                a.getTipo(),
                a.getModalidade(),
                a.getStatus(),
                a.descricao());
    }
}
