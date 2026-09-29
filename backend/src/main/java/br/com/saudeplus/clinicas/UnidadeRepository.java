package br.com.saudeplus.clinicas;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UnidadeRepository extends JpaRepository<Unidade, UUID> {

    List<Unidade> findByStatusOrderByNome(StatusUnidade status);

    List<Unidade> findByStatusAndCidadeIgnoreCaseAndUfIgnoreCaseOrderByNome(StatusUnidade status, String cidade, String uf);

    Optional<Unidade> findFirstByNome(String nome);

    long countByStatus(StatusUnidade status);

    boolean existsByCnpj(String cnpj);

    boolean existsByCnpjAndIdNot(String cnpj, UUID id);

    List<Unidade> findAllByOrderByNome();

    /** Cidades com pelo menos uma unidade em funcionamento, para o filtro da busca. */
    @Query("""
            select distinct new br.com.saudeplus.clinicas.Cidade(u.cidade, u.uf)
            from Unidade u
            where u.status = br.com.saudeplus.clinicas.StatusUnidade.ATIVA
            order by u.uf, u.cidade""")
    List<Cidade> cidadesAtendidas();
}
