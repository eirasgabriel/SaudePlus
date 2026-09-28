package br.com.saudeplus.pacientes;

import java.util.List;
import java.util.Optional;

public interface PacienteAcompanhadoRepository {

    List<PacienteAcompanhado> porMedico(String medicoId);

    Optional<PacienteAcompanhado> porId(String id);
}
