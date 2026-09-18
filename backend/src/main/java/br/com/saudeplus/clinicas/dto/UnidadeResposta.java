package br.com.saudeplus.clinicas.dto;

import br.com.saudeplus.clinicas.Unidade;

public record UnidadeResposta(
        String id,
        String nome,
        String cidade,
        String endereco,
        String telefone,
        String horario,
        String mapUrl) {

    public static UnidadeResposta de(Unidade unidade) {
        return new UnidadeResposta(
                unidade.id(),
                unidade.nome(),
                unidade.cidade(),
                unidade.endereco(),
                unidade.telefone(),
                unidade.horario(),
                unidade.mapUrl());
    }
}
