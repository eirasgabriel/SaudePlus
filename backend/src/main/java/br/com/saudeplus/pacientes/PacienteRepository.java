package br.com.saudeplus.pacientes;

import java.util.List;
import java.util.Optional;

public interface PacienteRepository {

    List<Paciente> porMedico(String medicoId);

    Optional<Paciente> porId(String id);
}
