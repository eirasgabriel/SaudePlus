package br.com.saudeplus.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.StatusConta;

/**
 * Conta vista pela administração. `medico` só vem para o papel MEDICO e
 * `paciente` só para PACIENTE.
 */
public record UsuarioAdminResposta(
        UUID id,
        String nome,
        String email,
        String telefone,
        String cpf,
        Papel papel,
        StatusConta status,
        String fotoUrl,
        Instant ultimoAcesso,
        Instant criadoEm,
        PerfilMedico medico,
        PerfilPaciente paciente) {

    public record Referencia(UUID id, String nome) {
    }

    public record PerfilMedico(UUID id, String crm, String crmUf, List<Referencia> especialidades,
            List<Referencia> unidades, BigDecimal valorConsulta, String bio) {
    }

    public record PerfilPaciente(UUID id, LocalDate dataNascimento) {
    }

    /** Números da tela de usuários; o front monta os cartões e calcula a variação. */
    public record Metricas(long total, long ativos, long bloqueados, long inativos, long novosNoMes,
            long novosNoMesAnterior) {
    }
}
