package br.com.saudeplus.areapaciente.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.clinicas.Unidade;

/**
 * Consulta vista pelo paciente.
 *
 * @param inicio data e hora locais da unidade, prontas para `new Date(...)` no front
 * @param podeAlterar cancelar e remarcar estão liberados (status e antecedência)
 */
public record ConsultaDoPacienteResposta(
        UUID id,
        LocalDate data,
        String horario,
        LocalDateTime inicio,
        Referencia especialidade,
        Referencia medico,
        Local unidade,
        TipoAtendimento tipo,
        Modalidade modalidade,
        StatusAgendamento status,
        String motivo,
        String motivoCancelamento,
        boolean podeAlterar) {

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    public record Referencia(UUID id, String nome) {
    }

    /** `endereco` já vem montado para exibir: "Rua das Flores, 123 – Centro, Saquarema - RJ". */
    public record Local(UUID id, String nome, String endereco, String telefone, String horarioFuncionamento,
            String mapUrl) {

        public static Local de(Unidade unidade) {
            String rua = unidade.getBairro() == null
                    ? unidade.getEndereco()
                    : unidade.getEndereco() + " – " + unidade.getBairro();
            return new Local(unidade.getId(), unidade.getNome(),
                    "%s, %s - %s".formatted(rua, unidade.getCidade(), unidade.getUf()),
                    unidade.getTelefone(), unidade.getHorarioFuncionamento(), unidade.getMapUrl());
        }
    }

    public static ConsultaDoPacienteResposta de(Agendamento agendamento, boolean podeAlterar) {
        return new ConsultaDoPacienteResposta(
                agendamento.getId(),
                agendamento.getData(),
                agendamento.getHorario().format(HORA),
                agendamento.inicio(),
                new Referencia(agendamento.getEspecialidade().getId(), agendamento.getEspecialidade().getNome()),
                new Referencia(agendamento.getMedico().getId(), agendamento.getMedico().getUsuario().getNomeCompleto()),
                Local.de(agendamento.getUnidade()),
                agendamento.getTipo(),
                agendamento.getModalidade(),
                agendamento.getStatus(),
                agendamento.getMotivo(),
                agendamento.getMotivoCancelamento(),
                podeAlterar);
    }
}
