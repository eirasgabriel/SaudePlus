package br.com.saudeplus.pacientes;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {

    Optional<Paciente> findByUsuarioId(UUID usuarioId);

    @EntityGraph(attributePaths = "usuario")
    List<Paciente> findByUsuarioIdIn(Collection<UUID> usuarioIds);

    /**
     * Pacientes que têm (ou tiveram) agendamento com o médico, por nome.
     * `padrao` é um LIKE em minúsculas; sem filtro, passe "%".
     */
    @Query(value = """
            select p from Paciente p join fetch p.usuario u
            where lower(u.nomeCompleto) like :padrao
              and exists (select 1 from Agendamento a where a.paciente = p and a.medico.id = :medicoId)
            order by u.nomeCompleto""",
            countQuery = """
            select count(p) from Paciente p join p.usuario u
            where lower(u.nomeCompleto) like :padrao
              and exists (select 1 from Agendamento a where a.paciente = p and a.medico.id = :medicoId)""")
    Page<Paciente> atendidosPeloMedico(UUID medicoId, String padrao, Pageable pagina);
}
