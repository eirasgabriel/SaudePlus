package br.com.saudeplus.profissionais;

import br.com.saudeplus.comum.EntidadeComId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Área médica do catálogo. O `slug` é o identificador estável usado em filtros e URLs. */
@Entity
@Table(name = "especialidades")
public class Especialidade extends EntidadeComId {

    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(length = 200)
    private String descricao;

    protected Especialidade() {
    }

    public Especialidade(String slug, String nome, String descricao) {
        this.slug = slug;
        alterar(nome, descricao);
    }

    /** O slug não muda: ele está em URLs e filtros já compartilhados. */
    public void alterar(String nome, String descricao) {
        this.nome = nome.strip();
        this.descricao = descricao == null || descricao.isBlank() ? null : descricao.strip();
    }

    public String getSlug() {
        return slug;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }
}
