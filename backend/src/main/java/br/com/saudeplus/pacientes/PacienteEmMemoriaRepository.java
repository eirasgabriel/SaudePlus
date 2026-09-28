package br.com.saudeplus.pacientes;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.saudeplus.dados.DadosDemonstracao;

@Repository
public class PacienteEmMemoriaRepository implements PacienteAcompanhadoRepository {

    private final List<PacienteAcompanhado> pacientes = DadosDemonstracao.pacientes();

    @Override
    public List<PacienteAcompanhado> porMedico(String medicoId) {
        return pacientes.stream().filter(paciente -> paciente.medicoId().equals(medicoId)).toList();
    }

    @Override
    public Optional<PacienteAcompanhado> porId(String id) {
        return pacientes.stream().filter(paciente -> paciente.id().equals(id)).findFirst();
    }
}
