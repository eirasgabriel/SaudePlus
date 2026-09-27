package br.com.saudeplus.clinicas;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.clinicas.dto.UnidadeResposta;

@RestController
public class UnidadeController {

    private final UnidadeService unidades;

    public UnidadeController(UnidadeService unidades) {
        this.unidades = unidades;
    }

    @GetMapping("/api/clinicas/{unidadeId}")
    public UnidadeResposta porId(@PathVariable String unidadeId) {
        return unidades.porId(unidadeId);
    }
}
