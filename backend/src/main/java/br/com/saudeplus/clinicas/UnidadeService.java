package br.com.saudeplus.clinicas;

import org.springframework.stereotype.Service;

import br.com.saudeplus.clinicas.dto.UnidadeResposta;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;

@Service
public class UnidadeService {

    private final UnidadeRepository unidades;

    public UnidadeService(UnidadeRepository unidades) {
        this.unidades = unidades;
    }

    public UnidadeResposta porId(String id) {
        return unidades.porId(id)
                .map(UnidadeResposta::de)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Unidade", id));
    }
}
