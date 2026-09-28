package br.com.saudeplus.usuarios;

/**
 * Perfil do usuário. Define a área do front e o prefixo de rota liberado
 * (`/api/paciente/**`, `/api/medico/**`, `/api/admin/**`).
 *
 * GESTOR, ENFERMEIRO, RECEPCIONISTA e AGENTE são papéis de equipe da tela de
 * administração; o acesso deles aos módulos vem da matriz de permissões.
 */
public enum Papel {
    PACIENTE,
    MEDICO,
    ADMIN,
    GESTOR,
    ENFERMEIRO,
    RECEPCIONISTA,
    AGENTE;

    /** Nome da authority no Spring Security, para `hasRole(...)`. */
    public String authority() {
        return "ROLE_" + name();
    }
}
