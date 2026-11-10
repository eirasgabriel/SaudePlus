package br.com.saudeplus.publico;

import org.springframework.data.domain.Sort;

/** Ordenações da busca. As chaves são os valores do `<select>` do front. */
enum OrdemDaBusca {
    RELEVANCIA("relevancia", Sort.by(
            Sort.Order.desc("totalAvaliacoes"), Sort.Order.desc("notaMedia"), Sort.Order.asc("usuario.nomeCompleto"))),
    AVALIACAO("avaliacao", Sort.by(
            Sort.Order.desc("notaMedia"), Sort.Order.desc("totalAvaliacoes"), Sort.Order.asc("usuario.nomeCompleto"))),
    AVALIACOES("avaliacoes", Sort.by(
            Sort.Order.desc("totalAvaliacoes"), Sort.Order.asc("usuario.nomeCompleto"))),
    NOME("nome", Sort.by(Sort.Order.asc("usuario.nomeCompleto")));

    private final String chave;
    private final Sort ordenacao;

    OrdemDaBusca(String chave, Sort ordenacao) {
        this.chave = chave;
        // O id no fim desempata: sem ele, a paginação pode repetir ou pular médicos empatados.
        this.ordenacao = ordenacao.and(Sort.by("id"));
    }

    Sort ordenacao() {
        return ordenacao;
    }

    static OrdemDaBusca porChave(String chave) {
        if (chave == null || chave.isBlank()) {
            return RELEVANCIA;
        }
        for (OrdemDaBusca ordem : values()) {
            if (ordem.chave.equalsIgnoreCase(chave)) {
                return ordem;
            }
        }
        throw new IllegalArgumentException("Ordenação desconhecida: " + chave);
    }
}
