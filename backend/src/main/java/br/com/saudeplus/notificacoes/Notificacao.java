package br.com.saudeplus.notificacoes;

import java.time.Instant;

import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Aviso para um usuário (paciente, médico ou admin). */
@Entity
@Table(name = "notificacoes")
public class Notificacao extends EntidadeComId {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 20)
    private TipoNotificacao tipo;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(length = 500)
    private String detalhe;

    @Column(nullable = false)
    private boolean lida;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private Instant criadaEm;

    protected Notificacao() {
    }

    public Notificacao(Usuario usuario, TipoNotificacao tipo, String titulo, String detalhe, Instant criadaEm) {
        this.usuario = usuario;
        this.tipo = tipo;
        this.titulo = titulo;
        this.detalhe = detalhe;
        this.criadaEm = criadaEm;
    }

    public void marcarComoLida() {
        lida = true;
    }

    public TipoNotificacao getTipo() {
        return tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDetalhe() {
        return detalhe;
    }

    public boolean isLida() {
        return lida;
    }

    public Instant getCriadaEm() {
        return criadaEm;
    }
}
