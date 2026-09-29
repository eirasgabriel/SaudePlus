package br.com.saudeplus.auth;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, Long> {

	Optional<TokenRedefinicaoSenha> findByTokenHash(String tokenHash);

	List<TokenRedefinicaoSenha> findByUsuarioIdAndUsadoEmIsNull(Long usuarioId);
}
