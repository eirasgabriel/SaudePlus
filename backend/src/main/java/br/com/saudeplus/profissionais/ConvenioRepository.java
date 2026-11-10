package br.com.saudeplus.profissionais;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConvenioRepository extends JpaRepository<Convenio, UUID> {

    List<Convenio> findByAtivoTrueOrderByNome();

    List<Convenio> findAllByOrderByNome();

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, UUID id);

    boolean existsByNomeIgnoreCase(String nome);
}
