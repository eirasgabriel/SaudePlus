package br.com.saudeplus.profissionais;

import java.time.Instant;
import java.util.UUID;

import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.pacientes.Paciente;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Nota de 1 a 5 que o paciente dá a um atendimento realizado. Uma por agendamento. */
@Entity
@Table(name = "avaliacoes")
public class Avaliacao extends EntidadeComId {

    @Column(name = "agendamento_id", nullable = false, unique = true)
    private UUID agendamentoId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @Column(nullable = false)
    private short nota;

    @Column(length = 1000)
    private String comentario;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Avaliacao() {
    }

    public Avaliacao(UUID agendamentoId, Paciente paciente, Medico medico, int nota, String comentario) {
        this.agendamentoId = agendamentoId;
        this.paciente = paciente;
        this.medico = medico;
        this.nota = (short) nota;
        this.comentario = comentario == null || comentario.isBlank() ? null : comentario.strip();
    }

    @PrePersist
    void aoCriar() {
        criadoEm = Instant.now();
    }

    public UUID getAgendamentoId() {
        return agendamentoId;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public int getNota() {
        return nota;
    }

    public String getComentario() {
        return comentario;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
