package br.com.saudeplus.pacientes;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.pacientes.dto.PacienteResposta;

@Service
public class PacienteService {

    private final PacienteAcompanhadoRepository pacientes;

    public PacienteService(PacienteAcompanhadoRepository pacientes) {
        this.pacientes = pacientes;
    }

    /**
     * Pacientes de um profissional. `limite` nulo ou não positivo devolve
     * todos — o painel pede 5, a tela cheia pede a lista inteira.
     */
    public List<PacienteResposta> doMedico(String medicoId, Integer limite) {
        List<PacienteResposta> todos = pacientes.porMedico(medicoId).stream()
                .map(PacienteResposta::de)
                .toList();
        if (limite == null || limite <= 0 || limite >= todos.size()) {
            return todos;
        }
        return todos.subList(0, limite);
    }

    public PacienteResposta porId(String id) {
        return pacientes.porId(id)
                .map(PacienteResposta::de)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Paciente", id));
    }
}
