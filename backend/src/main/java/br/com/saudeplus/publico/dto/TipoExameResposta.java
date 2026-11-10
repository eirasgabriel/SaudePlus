package br.com.saudeplus.publico.dto;

import java.util.UUID;

import br.com.saudeplus.exames.TipoExame;

/** Item do catálogo de exames, com o preparo — informação pública, útil antes de marcar. */
public record TipoExameResposta(UUID id, String nome, String categoria, String preparo, Short prazoResultadoDias) {

    public static TipoExameResposta de(TipoExame tipo) {
        return new TipoExameResposta(tipo.getId(), tipo.getNome(), tipo.getCategoria(), tipo.getPreparo(),
                tipo.getPrazoResultadoDias());
    }
}
