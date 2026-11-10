package br.com.saudeplus.exames;

import br.com.saudeplus.comum.EntidadeComId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Item do catálogo de exames, com as orientações de preparo. */
@Entity
@Table(name = "tipos_exame")
public class TipoExame extends EntidadeComId {

    @Column(nullable = false, unique = true, length = 120)
    private String nome;

    @Column(nullable = false, length = 80)
    private String categoria;

    @Column(columnDefinition = "text")
    private String preparo;

    @Column(name = "prazo_resultado_dias")
    private Short prazoResultadoDias;

    protected TipoExame() {
    }

    public TipoExame(String nome, String categoria, String preparo, Integer prazoResultadoDias) {
        alterar(nome, categoria, preparo, prazoResultadoDias);
    }

    public void alterar(String nome, String categoria, String preparo, Integer prazoResultadoDias) {
        this.nome = nome.strip();
        this.categoria = categoria.strip();
        this.preparo = preparo == null || preparo.isBlank() ? null : preparo.strip();
        this.prazoResultadoDias = prazoResultadoDias == null ? null : prazoResultadoDias.shortValue();
    }

    public String getNome() {
        return nome;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getPreparo() {
        return preparo;
    }

    public Short getPrazoResultadoDias() {
        return prazoResultadoDias;
    }
}
