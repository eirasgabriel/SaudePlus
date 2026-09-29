package br.com.saudeplus.publico.dto;

import java.util.UUID;

import br.com.saudeplus.profissionais.Especialidade;

public record EspecialidadeResposta(UUID id, String slug, String nome, String descricao) {

    public static EspecialidadeResposta de(Especialidade especialidade) {
        return new EspecialidadeResposta(
                especialidade.getId(), especialidade.getSlug(), especialidade.getNome(), especialidade.getDescricao());
    }
}
