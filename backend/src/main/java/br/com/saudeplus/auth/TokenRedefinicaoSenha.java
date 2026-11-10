package br.com.saudeplus.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Pedido de redefinição de senha. O banco guarda só o SHA-256 do token: quem
 * obtiver uma cópia da tabela não consegue montar um link válido.
 */
@Entity
@Table(name = "tokens_redefinicao_senha")
public class TokenRedefinicaoSenha extends EntidadeComId {

    private static final SecureRandom ALEATORIO = new SecureRandom();
    private static final int BYTES_DO_TOKEN = 32;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "hash_sha256", nullable = false, length = 64)
    private String hashSha256;

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    @Column(name = "usado_em")
    private Instant usadoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected TokenRedefinicaoSenha() {
    }

    TokenRedefinicaoSenha(Usuario usuario, String tokenEmClaro, Instant criadoEm, Instant expiraEm) {
        this.usuario = usuario;
        this.hashSha256 = hash(tokenEmClaro);
        this.criadoEm = criadoEm;
        this.expiraEm = expiraEm;
    }

    /** 32 bytes de aleatoriedade criptográfica em Base64 URL-safe, sem padding. */
    static String gerarTokenEmClaro() {
        byte[] bytes = new byte[BYTES_DO_TOKEN];
        ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String tokenEmClaro) {
        try {
            byte[] resumo = MessageDigest.getInstance("SHA-256").digest(tokenEmClaro.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resumo);
        } catch (NoSuchAlgorithmException excecao) {
            throw new IllegalStateException("A JVM não oferece SHA-256.", excecao);
        }
    }

    boolean utilizavelEm(Instant momento) {
        return usadoEm == null && momento.isBefore(expiraEm);
    }

    void consumir(Instant momento) {
        usadoEm = momento;
    }

    Usuario getUsuario() {
        return usuario;
    }
}
