package br.com.saudeplus.painel;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.painel.dto.PainelMedicoResposta;

@RestController
@RequestMapping("/api/medicos/{medicoId}")
public class PainelMedicoController {

    private final PainelMedicoService painel;

    public PainelMedicoController(PainelMedicoService painel) {
        this.painel = painel;
    }

    /**
     * Tudo o que a tela do painel precisa, numa chamada.
     * `data` no formato ISO (2026-09-15); omitida, usa o dia de referência.
     */
    @GetMapping("/painel")
    public PainelMedicoResposta obter(
            @PathVariable String medicoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return painel.montar(medicoId, data);
    }
}
