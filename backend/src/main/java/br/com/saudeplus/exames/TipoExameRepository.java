package br.com.saudeplus.exames;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoExameRepository extends JpaRepository<TipoExame, UUID> {

    Optional<TipoExame> findByNome(String nome);

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, UUID id);
}
