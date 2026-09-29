package br.com.saudeplus.profissionais;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicoRepository extends JpaRepository<Medico, UUID>, JpaSpecificationExecutor<Medico> {

    Optional<Medico> findByUsuarioId(UUID usuarioId);

    boolean existsByCrmAndCrmUf(String crm, String crmUf);

    @EntityGraph(attributePaths = "usuario")
    List<Medico> findByUsuarioIdIn(Collection<UUID> usuarioIds);

    @EntityGraph(attributePaths = "usuario")
    Optional<Medico> findComUsuarioById(UUID id);

    /** Pares unidade/especialidade dos médicos vinculados: a "especialidade" de cada unidade na administração. */
    @Query("""
            select distinct u.id, e.nome
            from Medico m join m.unidades u join m.especialidades e""")
    List<Object[]> especialidadesPorUnidade();

    /**
     * Soma uma nota à média e ao total numa instrução só. Ler, recalcular em
     * Java e gravar perdia avaliações simultâneas; aqui o banco serializa pela
     * linha do médico e cada UPDATE parte do valor já gravado pelo outro.
     */
    @Modifying(flushAutomatically = true)
    @Query(value = """
            update medicos
               set nota_media = round((nota_media * total_avaliacoes + :nota) / (total_avaliacoes + 1), 2),
                   total_avaliacoes = total_avaliacoes + 1
             where id = :id""", nativeQuery = true)
    int registrarAvaliacao(@Param("id") UUID id, @Param("nota") int nota);

    /** Quantos médicos estão vinculados a cada unidade. */
    @Query("select u.id, count(distinct m) from Medico m join m.unidades u group by u.id")
    List<Object[]> medicosPorUnidade();
}
