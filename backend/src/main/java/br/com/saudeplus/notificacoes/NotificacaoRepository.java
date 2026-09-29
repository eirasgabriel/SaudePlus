package br.com.saudeplus.notificacoes;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {

    List<Notificacao> findByUsuarioIdOrderByCriadaEmDesc(UUID usuarioId, Pageable limite);

    Optional<Notificacao> findByIdAndUsuarioId(UUID id, UUID usuarioId);

    long countByUsuarioIdAndLidaFalse(UUID usuarioId);

    boolean existsByUsuarioId(UUID usuarioId);

    @Modifying
    @Query("update Notificacao n set n.lida = true where n.usuario.id = :usuarioId and n.lida = false")
    int marcarTodasComoLidas(UUID usuarioId);
}
