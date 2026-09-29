package br.com.saudeplus.profissionais;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.DynamicUpdate;

import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Perfil profissional de um {@link Usuario} com papel MEDICO. Nome, foto e
 * contato ficam na conta; aqui fica o que é do exercício da medicina.
 *
 * As coleções usam `@BatchSize`: numa página da busca, as especialidades,
 * convênios e unidades de todos os médicos vêm em poucas consultas, e não uma
 * por médico.
 */
// Grava só as colunas alteradas: editar o perfil não pode sobrescrever a
// média e o total de avaliações, que mudam por UPDATE próprio (MedicoRepository).
@DynamicUpdate
@Entity
@Table(name = "medicos")
public class Medico extends EntidadeComId {

    private static final int LOTE = 50;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, length = 20)
    private String crm;

    @Column(name = "crm_uf", nullable = false, length = 2)
    private String crmUf;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(name = "valor_consulta", precision = 12, scale = 2)
    private BigDecimal valorConsulta;

    @Column(name = "nota_media", nullable = false, precision = 3, scale = 2)
    private BigDecimal notaMedia = BigDecimal.ZERO;

    @Column(name = "total_avaliacoes", nullable = false)
    private int totalAvaliacoes;

    @ManyToMany
    @JoinTable(name = "medico_especialidades",
            joinColumns = @JoinColumn(name = "medico_id"),
            inverseJoinColumns = @JoinColumn(name = "especialidade_id"))
    @BatchSize(size = LOTE)
    private Set<Especialidade> especialidades = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(name = "medico_convenios",
            joinColumns = @JoinColumn(name = "medico_id"),
            inverseJoinColumns = @JoinColumn(name = "convenio_id"))
    @BatchSize(size = LOTE)
    private Set<Convenio> convenios = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(name = "medico_unidades",
            joinColumns = @JoinColumn(name = "medico_id"),
            inverseJoinColumns = @JoinColumn(name = "unidade_id"))
    @BatchSize(size = LOTE)
    private Set<Unidade> unidades = new LinkedHashSet<>();

    protected Medico() {
    }

    public Medico(Usuario usuario, String crm, String crmUf) {
        this.usuario = usuario;
        this.crm = crm.strip();
        this.crmUf = crmUf.strip().toUpperCase();
    }

    public boolean atendeEm(Especialidade especialidade) {
        return especialidades.contains(especialidade);
    }

    /** Dados profissionais editados pela administração. */
    public void alterarPerfil(String crm, String crmUf, String bio, BigDecimal valorConsulta) {
        this.crm = crm.strip();
        this.crmUf = crmUf.strip().toUpperCase();
        this.bio = bio == null || bio.isBlank() ? null : bio.strip();
        this.valorConsulta = valorConsulta;
    }

    public void definirEspecialidades(Collection<Especialidade> novas) {
        especialidades.clear();
        especialidades.addAll(novas);
    }

    public void definirUnidades(Collection<Unidade> novas) {
        unidades.clear();
        unidades.addAll(novas);
    }

    /** Todas as unidades vinculadas, inclusive as fora de funcionamento (visão da administração). */
    public List<Unidade> unidadesVinculadas() {
        return unidades.stream().sorted(Comparator.comparing(Unidade::getNome)).toList();
    }

    public void adicionarEspecialidade(Especialidade especialidade) {
        especialidades.add(especialidade);
    }

    public void adicionarUnidade(Unidade unidade) {
        unidades.add(unidade);
    }

    /** Especialidades em ordem alfabética, para a resposta não mudar de uma chamada para outra. */
    public List<Especialidade> especialidadesOrdenadas() {
        return especialidades.stream().sorted(Comparator.comparing(Especialidade::getNome)).toList();
    }

    public List<Convenio> conveniosOrdenados() {
        return convenios.stream().filter(Convenio::isAtivo).sorted(Comparator.comparing(Convenio::getNome)).toList();
    }

    /** Só as unidades em funcionamento: as demais não aparecem para o paciente. */
    public List<Unidade> unidadesAtivas() {
        return unidades.stream().filter(Unidade::ativa).sorted(Comparator.comparing(Unidade::getNome)).toList();
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getCrm() {
        return crm;
    }

    public String getCrmUf() {
        return crmUf;
    }

    public String getBio() {
        return bio;
    }

    public BigDecimal getValorConsulta() {
        return valorConsulta;
    }

    public BigDecimal getNotaMedia() {
        return notaMedia;
    }

    public int getTotalAvaliacoes() {
        return totalAvaliacoes;
    }
}
