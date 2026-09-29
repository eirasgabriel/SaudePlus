package br.com.saudeplus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** E-mail e papel não mudam por aqui: e-mail é a identidade do login, papel é decisão do admin. */
public record AtualizarPerfilRequisicao(
        @NotBlank(message = "Informe o nome completo")
        @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres")
        String nomeCompleto,

        @Size(max = 20, message = "O telefone deve ter até 20 caracteres")
        @Pattern(regexp = "[0-9 ()+-]*", message = "Use apenas números, espaços e ( ) + -")
        String telefone,

        @Size(max = 500, message = "O endereço da foto deve ter até 500 caracteres")
        @Pattern(regexp = "(https://\\S+)?", message = "A foto precisa ser um endereço https")
        String fotoUrl) {
}
