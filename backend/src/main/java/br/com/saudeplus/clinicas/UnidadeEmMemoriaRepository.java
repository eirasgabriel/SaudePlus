package br.com.saudeplus.clinicas;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.saudeplus.dados.DadosDemonstracao;

@Repository
public class UnidadeEmMemoriaRepository implements UnidadeRepository {

    private final List<Unidade> unidades = DadosDemonstracao.unidades();

    @Override
    public Optional<Unidade> porId(String id) {
        return unidades.stream().filter(unidade -> unidade.id().equals(id)).findFirst();
    }
}
