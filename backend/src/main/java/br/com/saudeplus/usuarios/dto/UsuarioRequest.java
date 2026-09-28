package br.com.saudeplus.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Dados de entrada para criar ou atualizar um usuário.
 * {@code senha} é obrigatória na criação e opcional na atualização
 * (em branco mantém a senha atual).
 */
public record UsuarioRequest(
        @NotBlank(message = "Nome é obrigatório.")
        String nome,

        @NotBlank(message = "Email é obrigatório.")
        @Email(message = "Email inválido.")
        String email,

        String senha,

        @NotBlank(message = "Cargo é obrigatório.")
        String cargo,

        String perfil,

        String status,

        String cpf,

        String telefone,

        String unidade
) {
}
