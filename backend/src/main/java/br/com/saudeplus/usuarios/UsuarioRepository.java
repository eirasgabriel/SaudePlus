package br.com.saudeplus.usuarios;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import br.com.saudeplus.clinicas.StatusUnidade;
import org.springframework.data.jpa.repository.EntityGraph;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * E-mail e CPF só valem entre contas não excluídas: a conta excluída guarda os
 * dois (LGPD), mas não entra, não recebe recuperação de senha e não impede um
 * novo cadastro da mesma pessoa (índices únicos parciais da V9).
 */
public interface UsuarioRepository extends JpaRepository<Usuario, UUID>, JpaSpecificationExecutor<Usuario> {

    /** Recebe o e-mail já normalizado ({@link Usuario#normalizarEmail}). */
    @Query("select u from Usuario u where u.email = :email"
            + " and u.status <> br.com.saudeplus.usuarios.StatusConta.EXCLUIDO")
    Optional<Usuario> findByEmail(@Param("email") String email);

    @Query("select count(u) > 0 from Usuario u where u.email = :email"
            + " and u.status <> br.com.saudeplus.usuarios.StatusConta.EXCLUIDO")
    boolean existsByEmail(@Param("email") String email);

    /** A rota pública da foto só serve chaves que são foto de perfil (não resultados de exame). */
    boolean existsByFotoChave(String fotoChave);

    @EntityGraph(attributePaths = "unidade")
    Optional<Usuario> findByUnidadeId(UUID unidadeId);

    @EntityGraph(attributePaths = "unidade")
    List<Usuario> findAllByPapel(Papel papel);

    boolean existsByIdAndUnidadeStatus(UUID id, StatusUnidade status);

    @Query("select count(u) > 0 from Usuario u where u.cpf = :cpf and u.id <> :id"
            + " and u.status <> br.com.saudeplus.usuarios.StatusConta.EXCLUIDO")
    boolean existsByCpfAndIdNot(@Param("cpf") String cpf, @Param("id") UUID id);

    @Query("select count(u) > 0 from Usuario u where u.cpf = :cpf"
            + " and u.status <> br.com.saudeplus.usuarios.StatusConta.EXCLUIDO")
    boolean existsByCpf(@Param("cpf") String cpf);

    long countByStatus(StatusConta status);

    long countByStatusNot(StatusConta status);

    long countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(Instant de, Instant ate);
}
