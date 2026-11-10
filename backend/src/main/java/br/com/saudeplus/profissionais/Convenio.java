package br.com.saudeplus.profissionais;

import br.com.saudeplus.comum.EntidadeComId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Plano de saúde aceito por médicos e informado pelo paciente. */
@Entity
@Table(name = "convenios")
public class Convenio extends EntidadeComId {

    @Column(nullable = false, unique = true, length = 80)
    private String nome;

    @Column(nullable = false)
    private boolean ativo = true;

    protected Convenio() {
    }

    public Convenio(String nome) {
        this.nome = nome.strip();
    }

    public void alterar(String nome, boolean ativo) {
        this.nome = nome.strip();
        this.ativo = ativo;
    }

    public String getNome() {
        return nome;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
