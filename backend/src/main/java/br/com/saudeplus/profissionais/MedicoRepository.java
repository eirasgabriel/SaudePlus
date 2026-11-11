package br.com.saudeplus.profissionais;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicoRepository extends JpaRepository<Medico, UUID>, JpaSpecificationExecutor<Medico> {

    Optional<Medico> findByUsuarioId(UUID usuarioId);

    boolean existsByCrmAndCrmUfAndExcluidoFalse(String crm, String crmUf);

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

    /** Corpo clínico de uma unidade, com a conta de cada médico. */
    @Query("select m from Medico m join fetch m.usuario join m.unidades u where u.id = :unidadeId")
    List<Medico> vinculadosA(@Param("unidadeId") UUID unidadeId);

    /** Médicos de conta ativa, fora da unidade, cujo nome ou CRM contém o padrão (já minúsculo). */
    @Query("""
            select m from Medico m join fetch m.usuario usr
            where usr.status = br.com.saudeplus.usuarios.StatusConta.ATIVO
              and (lower(usr.nomeCompleto) like :padrao or lower(m.crm) like :padrao)
              and not exists (select 1 from Medico m2 join m2.unidades u2 where m2 = m and u2.id = :unidadeId)
            order by usr.nomeCompleto""")
    List<Medico> disponiveisPara(@Param("unidadeId") UUID unidadeId, @Param("padrao") String padrao, Pageable pagina);

    /** Quantos médicos estão vinculados a cada unidade. */
    @Query("select u.id, count(distinct m) from Medico m join m.unidades u group by u.id")
    List<Object[]> medicosPorUnidade();
}
