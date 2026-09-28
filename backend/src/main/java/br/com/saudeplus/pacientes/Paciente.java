package br.com.saudeplus.pacientes;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * Perfil de paciente de um {@link Usuario}. Nasce junto com a conta no
 * cadastro público; dados clínicos e de convênio são preenchidos depois.
 */
@Entity
@Table(name = "pacientes")
public class Paciente extends EntidadeComId {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(length = 20)
    private String sexo;

    // Vira associação com Convenio quando o catálogo ganhar entidade (fase 2).
    @Column(name = "convenio_id")
    private UUID convenioId;

    @Column(name = "numero_carteirinha", length = 40)
    private String numeroCarteirinha;

    protected Paciente() {
    }

    public Paciente(Usuario usuario) {
        this.usuario = usuario;
    }

    /** Idade em anos completos na data informada, ou `null` sem data de nascimento. */
    public Integer idadeEm(LocalDate data) {
        return dataNascimento == null ? null : Period.between(dataNascimento, data).getYears();
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public String getSexo() {
        return sexo;
    }

    public UUID getConvenioId() {
        return convenioId;
    }

    public String getNumeroCarteirinha() {
        return numeroCarteirinha;
    }
}
