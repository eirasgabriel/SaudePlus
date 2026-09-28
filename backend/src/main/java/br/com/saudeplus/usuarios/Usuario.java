package br.com.saudeplus.usuarios;

import java.time.Instant;
import java.util.Locale;

import br.com.saudeplus.comum.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * Conta de acesso: quem entra no sistema e com qual papel. Os dados de cada
 * perfil (paciente, médico) ficam nas tabelas próprias, ligadas 1:1 por
 * `usuario_id`.
 */
@Entity
@Table(name = "usuarios")
public class Usuario extends EntidadeBase {

    @Column(name = "nome_completo", nullable = false, length = 120)
    private String nomeCompleto;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;

    @Column(length = 20)
    private String telefone;

    @Column(length = 14)
    private String cpf;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel papel;

    @Column(nullable = false, length = 20)
    private StatusConta status = StatusConta.ATIVO;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "ultimo_acesso")
    private Instant ultimoAcesso;

    protected Usuario() {
    }

    public Usuario(String nomeCompleto, String email, String senhaHash, String telefone, Papel papel) {
        this.nomeCompleto = nomeCompleto.strip();
        this.email = normalizarEmail(email);
        this.senhaHash = senhaHash;
        this.telefone = vazioComoNulo(telefone);
        this.papel = papel;
    }

    /** E-mail é comparado sempre em minúsculas e sem espaços nas pontas. */
    public static String normalizarEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    public boolean ativo() {
        return status == StatusConta.ATIVO;
    }

    public void registrarAcesso(Instant momento) {
        ultimoAcesso = momento;
    }

    public void trocarSenha(String novoHash) {
        senhaHash = novoHash;
    }

    public void atualizarPerfil(String nomeCompleto, String telefone, String fotoUrl) {
        this.nomeCompleto = nomeCompleto.strip();
        this.telefone = vazioComoNulo(telefone);
        this.fotoUrl = vazioComoNulo(fotoUrl);
    }

    public void alterarStatus(StatusConta status) {
        this.status = status;
    }

    private static String vazioComoNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.strip();
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getCpf() {
        return cpf;
    }

    public Papel getPapel() {
        return papel;
    }

    public StatusConta getStatus() {
        return status;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public Instant getUltimoAcesso() {
        return ultimoAcesso;
    }
}
