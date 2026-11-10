package br.com.saudeplus.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, UUID> {

    Optional<TokenRedefinicaoSenha> findByHashSha256(String hashSha256);

    /** Um pedido novo invalida os links anteriores ainda não usados. */
    @Modifying
    @Query("delete from TokenRedefinicaoSenha t where t.usuario.id = :usuarioId and t.usadoEm is null")
    void apagarPendentesDoUsuario(UUID usuarioId);
}
