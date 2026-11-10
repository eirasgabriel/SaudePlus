package br.com.saudeplus.publico.dto;

import java.util.UUID;

import br.com.saudeplus.profissionais.Convenio;

public record ConvenioResposta(UUID id, String nome) {

    public static ConvenioResposta de(Convenio convenio) {
        return new ConvenioResposta(convenio.getId(), convenio.getNome());
    }
}
