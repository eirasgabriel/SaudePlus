package br.com.saudeplus.profissionais.dto;

import br.com.saudeplus.profissionais.Medico;

/** Profissional como o painel precisa dele. */
public record MedicoResposta(
        String id,
        String nome,
        String perfil,
        String especialidade,
        String crm,
        String avatarUrl) {

    public static MedicoResposta de(Medico medico) {
        return new MedicoResposta(
                medico.id(),
                medico.nome(),
                medico.perfil(),
                medico.especialidade(),
                medico.crm(),
                medico.avatarUrl());
    }
}
