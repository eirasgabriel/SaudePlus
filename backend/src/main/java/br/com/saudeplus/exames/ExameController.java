package br.com.saudeplus.exames;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.exames.dto.ExameResposta;

@RestController
public class ExameController {

    private final ExameService exames;

    public ExameController(ExameService exames) {
        this.exames = exames;
    }

    @GetMapping("/api/medicos/{medicoId}/exames-pendentes")
    public List<ExameResposta> pendentes(@PathVariable String medicoId) {
        return exames.pendentesDoMedico(medicoId);
    }
}
