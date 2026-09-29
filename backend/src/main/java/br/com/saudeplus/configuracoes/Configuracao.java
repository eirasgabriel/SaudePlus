package br.com.saudeplus.configuracoes;

import java.time.Instant;

import org.hibernate.annotations.ColumnTransformer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/** Um grupo de configurações do sistema, guardado como objeto JSON (`jsonb`). */
@Entity
@Table(name = "configuracoes")
public class Configuracao {

    @Id
    @Column(length = 80)
    private String chave;

    /** O `::jsonb` deixa o Postgres aceitar o texto JSON na coluna `jsonb`. */
    @Column(nullable = false, columnDefinition = "jsonb")
    @ColumnTransformer(write = "?::jsonb")
    private String valor;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected Configuracao() {
    }

    public Configuracao(String chave, String valor) {
        this.chave = chave;
        this.valor = valor;
    }

    @PrePersist
    @PreUpdate
    void carimbar() {
        atualizadoEm = Instant.now();
    }

    public void alterar(String novoValor) {
        valor = novoValor;
    }

    public String getChave() {
        return chave;
    }

    public String getValor() {
        return valor;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}
