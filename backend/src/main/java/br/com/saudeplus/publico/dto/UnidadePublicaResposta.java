package br.com.saudeplus.publico.dto;

import java.util.UUID;

import br.com.saudeplus.clinicas.Unidade;

/** Unidade como o paciente vê: onde fica e como falar com ela. */
public record UnidadePublicaResposta(
        UUID id,
        String nome,
        String endereco,
        String bairro,
        String cidade,
        String uf,
        String telefone,
        String horarioFuncionamento,
        String mapUrl) {

    public static UnidadePublicaResposta de(Unidade unidade) {
        return new UnidadePublicaResposta(
                unidade.getId(),
                unidade.getNome(),
                unidade.getEndereco(),
                unidade.getBairro(),
                unidade.getCidade(),
                unidade.getUf(),
                unidade.getTelefone(),
                unidade.getHorarioFuncionamento(),
                unidade.getMapUrl());
    }
}
