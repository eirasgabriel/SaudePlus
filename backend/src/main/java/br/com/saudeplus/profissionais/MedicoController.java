package br.com.saudeplus.profissionais;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.profissionais.dto.MedicoResposta;

@RestController
public class MedicoController {

    private final MedicoService medicos;

    public MedicoController(MedicoService medicos) {
        this.medicos = medicos;
    }

    @GetMapping("/api/medicos/{medicoId}")
    public MedicoResposta porId(@PathVariable String medicoId) {
        return medicos.porId(medicoId);
    }
}
