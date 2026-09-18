package br.com.saudeplus.profissionais;

/** Profissional de saúde que usa o painel. */
public record Medico(
        String id,
        String nome,
        String perfil,
        String especialidade,
        String crm,
        String avatarUrl,
        String unidadeId) {
}
