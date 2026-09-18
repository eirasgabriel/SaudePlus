package br.com.saudeplus.exames;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.exames.dto.ExameResposta;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;

@Service
public class ExameService {

    private final ExameRepository exames;
    private final PacienteRepository pacientes;

    public ExameService(ExameRepository exames, PacienteRepository pacientes) {
        this.exames = exames;
        this.pacientes = pacientes;
    }

    public List<ExameResposta> pendentesDoMedico(String medicoId) {
        return exames.pendentesPorMedico(medicoId).stream()
                .map(exame -> ExameResposta.de(
                        exame,
                        pacientes.porId(exame.pacienteId()).map(Paciente::nome).orElse("Paciente")))
                .toList();
    }
}
