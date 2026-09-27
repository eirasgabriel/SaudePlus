package br.com.saudeplus.pacientes;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.pacientes.dto.PacienteResposta;

@RestController
public class PacienteController {

    private final PacienteService pacientes;

    public PacienteController(PacienteService pacientes) {
        this.pacientes = pacientes;
    }

    /** `limite` omitido devolve todos os pacientes do profissional. */
    @GetMapping("/api/medicos/{medicoId}/pacientes")
    public List<PacienteResposta> doMedico(
            @PathVariable String medicoId,
            @RequestParam(required = false) Integer limite) {
        return pacientes.doMedico(medicoId, limite);
    }

    @GetMapping("/api/pacientes/{pacienteId}")
    public PacienteResposta porId(@PathVariable String pacienteId) {
        return pacientes.porId(pacienteId);
    }
}
