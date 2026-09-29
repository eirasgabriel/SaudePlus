package br.com.saudeplus.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** Token de uso unico para redefinir senha. Guarda so o hash SHA-256, nunca o token. */
@Entity
@Table(name = "tokens_redefinicao_senha")
public class TokenRedefinicaoSenha {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "token_hash", nullable = false, length = 64, unique = true)
	private String tokenHash;

	@Column(name = "expira_em", nullable = false)
	private Instant expiraEm;

	@Column(name = "usado_em")
	private Instant usadoEm;

	@Column(name = "criado_em", nullable = false)
	private Instant criadoEm = Instant.now();

	protected TokenRedefinicaoSenha() {
		// exigido pelo JPA
	}

	public TokenRedefinicaoSenha(Usuario usuario, String tokenHash, Instant expiraEm) {
		this.usuario = usuario;
		this.tokenHash = tokenHash;
		this.expiraEm = expiraEm;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public boolean estaValido(Instant agora) {
		return usadoEm == null && expiraEm.isAfter(agora);
	}

	public void consumir(Instant agora) {
		this.usadoEm = agora;
	}
}
