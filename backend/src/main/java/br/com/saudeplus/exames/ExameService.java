package br.com.saudeplus.exames;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.exames.dto.ExameResposta;
import br.com.saudeplus.pacientes.PacienteAcompanhado;
import br.com.saudeplus.pacientes.PacienteAcompanhadoRepository;

@Service
public class ExameService {

    private final ExameRepository exames;
    private final PacienteAcompanhadoRepository pacientes;

    public ExameService(ExameRepository exames, PacienteAcompanhadoRepository pacientes) {
        this.exames = exames;
        this.pacientes = pacientes;
    }

    public List<ExameResposta> pendentesDoMedico(String medicoId) {
        return exames.pendentesPorMedico(medicoId).stream()
                .map(exame -> ExameResposta.de(
                        exame,
                        pacientes.porId(exame.pacienteId()).map(PacienteAcompanhado::nome).orElse("Paciente")))
                .toList();
    }
}
