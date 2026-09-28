package br.com.saudeplus.pacientes;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    Optional<Paciente> findByUsuarioId(UUID usuarioId);
}
