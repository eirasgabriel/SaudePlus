package br.com.saudeplus.publico.dto;

import br.com.saudeplus.clinicas.Cidade;

/** `rotulo` é o texto que o filtro de cidade do front exibe ("São Paulo - SP"). */
public record CidadeResposta(String nome, String uf, String rotulo) {

    public static CidadeResposta de(Cidade cidade) {
        return new CidadeResposta(cidade.nome(), cidade.uf(), cidade.rotulo());
    }
}
