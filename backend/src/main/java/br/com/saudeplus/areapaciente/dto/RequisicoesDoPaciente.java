package br.com.saudeplus.areapaciente.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import br.com.saudeplus.agenda.Modalidade;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Corpos de requisição da área do paciente. */
public final class RequisicoesDoPaciente {

    private RequisicoesDoPaciente() {
    }

    /**
     * Reserva de um horário livre. A unidade sai do próprio horário escolhido;
     * `modalidade` só é preciso quando o mesmo horário é oferecido em mais de uma.
     */
    public record Reservar(
            @NotNull(message = "Escolha um profissional.") UUID medicoId,
            @NotNull(message = "Escolha uma especialidade.") UUID especialidadeId,
            @NotNull(message = "Informe a data da consulta.") LocalDate data,
            @NotNull(message = "Escolha um horário.") LocalTime horario,
            Modalidade modalidade,
            @Size(max = 300, message = "O motivo deve ter até 300 caracteres") String motivo) {
    }

    public record Remarcar(
            @NotNull(message = "Informe a nova data.") LocalDate data,
            @NotNull(message = "Escolha um horário.") LocalTime horario,
            Modalidade modalidade) {
    }

    public record Cancelar(@Size(max = 300, message = "O motivo deve ter até 300 caracteres") String motivo) {
    }

    /**
     * "Minhas informações". O e-mail não muda (é o login). O CPF pode ser
     * informado uma vez; depois, só a administração corrige.
     */
    public record AtualizarPerfil(
            @NotBlank(message = "Informe o nome completo")
            @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres") String nomeCompleto,
            @Size(max = 20, message = "O telefone deve ter até 20 caracteres")
            @Pattern(regexp = "[0-9 ()+-]*", message = "Use apenas números, espaços e ( ) + -") String telefone,
            @Past(message = "A data de nascimento precisa ser no passado") LocalDate dataNascimento,
            @Pattern(regexp = "(feminino|masculino|outro|nao_informado)?",
                    message = "Use feminino, masculino, outro ou nao_informado") String sexo,
            String cpf,
            UUID convenioId,
            @Size(max = 40, message = "A carteirinha deve ter até 40 caracteres") String numeroCarteirinha) {
    }

    public record Avaliar(
            @NotNull(message = "Informe a consulta avaliada.") UUID agendamentoId,
            @NotNull(message = "Dê uma nota de 1 a 5.") @Min(value = 1, message = "Dê uma nota de 1 a 5.")
            @Max(value = 5, message = "Dê uma nota de 1 a 5.") Integer nota,
            @Size(max = 1000, message = "O comentário deve ter até 1000 caracteres") String comentario) {
    }
}
