package br.com.saudeplus.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.clinicas.StatusUnidade;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.StatusConta;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Corpos de requisição da área administrativa. */
public final class RequisicoesAdmin {

    private RequisicoesAdmin() {
    }

    // ------------------------------------------------------------------ usuários

    /**
     * Conta criada pela administração. Não tem senha: a pessoa recebe um
     * convite por e-mail para definir a sua. `medico` é obrigatório quando o
     * papel é MEDICO; `paciente`, opcional quando é PACIENTE.
     */
    public record CriarUsuario(
            @NotBlank(message = "Informe o nome completo")
            @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres") String nomeCompleto,
            @NotBlank(message = "Informe o e-mail") @Email(message = "Informe um e-mail válido")
            @Size(max = 180, message = "O e-mail deve ter até 180 caracteres") String email,
            @Size(max = 20, message = "O telefone deve ter até 20 caracteres")
            @Pattern(regexp = "[0-9 ()+-]*", message = "Use apenas números, espaços e ( ) + -") String telefone,
            String cpf,
            @NotNull(message = "Escolha o perfil") Papel papel,
            @Valid DadosDeMedico medico,
            @Valid DadosDePaciente paciente) {
    }

    /** O e-mail não muda por aqui: é a identidade de login da pessoa. */
    public record AlterarUsuario(
            @NotBlank(message = "Informe o nome completo")
            @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres") String nomeCompleto,
            @Size(max = 20, message = "O telefone deve ter até 20 caracteres")
            @Pattern(regexp = "[0-9 ()+-]*", message = "Use apenas números, espaços e ( ) + -") String telefone,
            String cpf,
            @NotNull(message = "Escolha o perfil") Papel papel,
            @Valid DadosDeMedico medico) {
    }

    public record DadosDeMedico(
            @NotBlank(message = "Informe o CRM") @Size(max = 20, message = "O CRM deve ter até 20 caracteres") String crm,
            @NotBlank(message = "Informe a UF do CRM") @Pattern(regexp = "[A-Za-z]{2}", message = "Use a sigla do estado") String crmUf,
            @NotEmpty(message = "Escolha ao menos uma especialidade") List<UUID> especialidadeIds,
            List<UUID> unidadeIds,
            @DecimalMin(value = "0", message = "O valor não pode ser negativo") BigDecimal valorConsulta,
            @Size(max = 2000, message = "A apresentação deve ter até 2000 caracteres") String bio) {
    }

    public record DadosDePaciente(LocalDate dataNascimento) {
    }

    public record AlterarStatusDoUsuario(@NotNull(message = "Informe o status") StatusConta status) {
    }

    // ------------------------------------------------------------------ unidades

    public record SalvarUnidade(
            @NotBlank(message = "Informe o nome") @Size(max = 120, message = "Até 120 caracteres") String nome,
            @NotBlank(message = "Informe o endereço") @Size(max = 200, message = "Até 200 caracteres") String endereco,
            @Size(max = 80, message = "Até 80 caracteres") String bairro,
            @NotBlank(message = "Informe a cidade") @Size(max = 80, message = "Até 80 caracteres") String cidade,
            @NotBlank(message = "Informe a UF") @Pattern(regexp = "[A-Za-z]{2}", message = "Use a sigla do estado") String uf,
            @Size(max = 20, message = "Até 20 caracteres") String telefone,
            @Size(max = 200, message = "Até 200 caracteres") String horarioFuncionamento,
            @Size(max = 500, message = "Até 500 caracteres") @Pattern(regexp = "(https://\\S+)?", message = "Use um endereço https") String mapUrl) {
    }

    public record AlterarStatusDaUnidade(@NotNull(message = "Informe o status") StatusUnidade status) {
    }

    // ------------------------------------------------------------------ catálogos

    public record SalvarEspecialidade(
            @NotBlank(message = "Informe o nome") @Size(max = 80, message = "Até 80 caracteres") String nome,
            @Size(max = 200, message = "Até 200 caracteres") String descricao) {
    }

    public record SalvarConvenio(
            @NotBlank(message = "Informe o nome") @Size(max = 80, message = "Até 80 caracteres") String nome,
            Boolean ativo) {
    }

    public record SalvarTipoExame(
            @NotBlank(message = "Informe o nome") @Size(max = 120, message = "Até 120 caracteres") String nome,
            @NotBlank(message = "Informe a categoria") @Size(max = 80, message = "Até 80 caracteres") String categoria,
            @Size(max = 2000, message = "Até 2000 caracteres") String preparo,
            @Min(value = 0, message = "Não pode ser negativo") @Max(value = 365, message = "No máximo 365 dias") Integer prazoResultadoDias) {
    }

    // ------------------------------------------------------------------ agendamentos

    /** `motivo` vale para `cancelada`; o paciente recebe o aviso. */
    public record AlterarStatusDoAgendamento(
            @NotNull(message = "Informe o novo status") StatusAgendamento status,
            @Size(max = 300, message = "O motivo deve ter até 300 caracteres") String motivo) {
    }
}
