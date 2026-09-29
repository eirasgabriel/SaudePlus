package br.com.saudeplus.profissionais;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EspecialidadeRepository extends JpaRepository<Especialidade, UUID> {

    List<Especialidade> findAllByOrderByNome();

    Optional<Especialidade> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
