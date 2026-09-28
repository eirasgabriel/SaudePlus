package br.com.saudeplus.usuarios;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    /** Recebe o e-mail já normalizado ({@link Usuario#normalizarEmail}). */
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}
