package br.com.saudeplus.agenda;

import java.time.Instant;

import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.profissionais.Medico;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Período em que o médico não atende (férias, congresso, folga). */
@Entity
@Table(name = "bloqueios_agenda")
public class BloqueioAgenda extends EntidadeComId {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @Column(nullable = false)
    private Instant inicio;

    @Column(nullable = false)
    private Instant fim;

    @Column(length = 200)
    private String motivo;

    protected BloqueioAgenda() {
    }

    public BloqueioAgenda(Medico medico, Instant inicio, Instant fim, String motivo) {
        this.medico = medico;
        this.inicio = inicio;
        this.fim = fim;
        this.motivo = motivo == null || motivo.isBlank() ? null : motivo.strip();
    }

    public Medico getMedico() {
        return medico;
    }

    public Instant getInicio() {
        return inicio;
    }

    public Instant getFim() {
        return fim;
    }

    public String getMotivo() {
        return motivo;
    }
}
