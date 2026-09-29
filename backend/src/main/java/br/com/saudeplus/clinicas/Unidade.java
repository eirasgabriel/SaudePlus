package br.com.saudeplus.clinicas;

import java.time.Instant;

import br.com.saudeplus.comum.EntidadeComId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Local de atendimento (clínica, posto, policlínica). */
@Entity
@Table(name = "unidades")
public class Unidade extends EntidadeComId {

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 200)
    private String endereco;

    @Column(length = 80)
    private String bairro;

    @Column(nullable = false, length = 80)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String uf;

    @Column(length = 20)
    private String telefone;

    @Column(name = "horario_funcionamento", length = 200)
    private String horarioFuncionamento;

    @Column(name = "map_url", length = 500)
    private String mapUrl;

    @Column(nullable = false, length = 20)
    private StatusUnidade status = StatusUnidade.ATIVA;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Unidade() {
    }

    public Unidade(String nome, String endereco, String bairro, String cidade, String uf, String telefone,
            String horarioFuncionamento, String mapUrl) {
        alterar(nome, endereco, bairro, cidade, uf, telefone, horarioFuncionamento, mapUrl);
    }

    public void alterar(String nome, String endereco, String bairro, String cidade, String uf, String telefone,
            String horarioFuncionamento, String mapUrl) {
        this.nome = nome.strip();
        this.endereco = endereco.strip();
        this.bairro = vazioComoNulo(bairro);
        this.cidade = cidade.strip();
        this.uf = uf.strip().toUpperCase();
        this.telefone = vazioComoNulo(telefone);
        this.horarioFuncionamento = vazioComoNulo(horarioFuncionamento);
        this.mapUrl = vazioComoNulo(mapUrl);
    }

    public void alterarStatus(StatusUnidade status) {
        this.status = status;
    }

    private static String vazioComoNulo(String valor) {
        return valor == null || valor.isBlank() ? null : valor.strip();
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    @PrePersist
    void aoCriar() {
        criadoEm = Instant.now();
    }

    public boolean ativa() {
        return status == StatusUnidade.ATIVA;
    }

    public String getNome() {
        return nome;
    }

    public String getEndereco() {
        return endereco;
    }

    public String getBairro() {
        return bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public String getUf() {
        return uf;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getHorarioFuncionamento() {
        return horarioFuncionamento;
    }

    public String getMapUrl() {
        return mapUrl;
    }

    public StatusUnidade getStatus() {
        return status;
    }
}
