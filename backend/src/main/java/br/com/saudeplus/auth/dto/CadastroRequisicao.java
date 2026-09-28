package br.com.saudeplus.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Cadastro público. Não tem campo de perfil de propósito: o servidor grava
 * sempre PACIENTE, e um `"role"` enviado pelo cliente é ignorado.
 */
public record CadastroRequisicao(
        @NotBlank(message = "Informe o nome completo")
        @Size(min = 3, max = 120, message = "O nome deve ter entre 3 e 120 caracteres")
        String nomeCompleto,

        @NotBlank(message = "Informe o e-mail")
        @Email(message = "Informe um e-mail válido")
        @Size(max = 180, message = "O e-mail deve ter até 180 caracteres")
        String email,

        @NotBlank(message = "Informe a senha")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres")
        String senha,

        @Size(max = 20, message = "O telefone deve ter até 20 caracteres")
        @Pattern(regexp = "[0-9 ()+-]*", message = "Use apenas números, espaços e ( ) + -")
        String telefone,

        @NotNull(message = "É preciso aceitar os termos de uso")
        @AssertTrue(message = "É preciso aceitar os termos de uso")
        Boolean aceiteTermos) {
}
