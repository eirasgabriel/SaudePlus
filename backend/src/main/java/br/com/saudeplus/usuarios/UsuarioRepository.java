package br.com.saudeplus.usuarios;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID>, JpaSpecificationExecutor<Usuario> {

    /** Recebe o e-mail já normalizado ({@link Usuario#normalizarEmail}). */
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    /** A rota pública da foto só serve chaves que são foto de perfil (não resultados de exame). */
    boolean existsByFotoChave(String fotoChave);

    boolean existsByCpfAndIdNot(String cpf, UUID id);

    boolean existsByCpf(String cpf);

    long countByStatus(StatusConta status);

    long countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(Instant de, Instant ate);
}
