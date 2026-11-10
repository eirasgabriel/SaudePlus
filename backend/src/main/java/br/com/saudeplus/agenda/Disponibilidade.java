package br.com.saudeplus.agenda;

import java.time.DayOfWeek;
import java.time.LocalTime;

import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.profissionais.Medico;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Janela semanal de atendimento: "às segundas, das 08:00 às 12:00, na unidade
 * X, consultas presenciais de 30 minutos". Os horários livres saem daqui,
 * menos bloqueios e agendamentos. As modalidades que um médico oferece são as
 * das suas disponibilidades.
 */
@Entity
@Table(name = "disponibilidades")
public class Disponibilidade extends EntidadeComId {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidade_id", nullable = false)
    private Unidade unidade;

    /** ISO-8601: 1 = segunda, 7 = domingo. */
    @Column(name = "dia_semana", nullable = false)
    private short diaSemana;

    @Column(nullable = false)
    private LocalTime inicio;

    @Column(nullable = false)
    private LocalTime fim;

    @Column(name = "duracao_min", nullable = false)
    private short duracaoMin;

    @Column(nullable = false, length = 20)
    private Modalidade modalidade = Modalidade.PRESENCIAL;

    protected Disponibilidade() {
    }

    public Disponibilidade(Medico medico, Unidade unidade, DayOfWeek diaSemana, LocalTime inicio, LocalTime fim,
            int duracaoMin, Modalidade modalidade) {
        this.medico = medico;
        alterar(unidade, diaSemana, inicio, fim, duracaoMin, modalidade);
    }

    public void alterar(Unidade unidade, DayOfWeek diaSemana, LocalTime inicio, LocalTime fim, int duracaoMin,
            Modalidade modalidade) {
        this.unidade = unidade;
        this.diaSemana = (short) diaSemana.getValue();
        this.inicio = inicio;
        this.fim = fim;
        this.duracaoMin = (short) duracaoMin;
        this.modalidade = modalidade;
    }

    /** Duas janelas do mesmo dia da semana se sobrepõem no horário. */
    public boolean sobrepoe(DayOfWeek outroDia, LocalTime outroInicio, LocalTime outroFim) {
        return getDiaSemana() == outroDia && inicio.isBefore(outroFim) && outroInicio.isBefore(fim);
    }

    public Medico getMedico() {
        return medico;
    }

    public Unidade getUnidade() {
        return unidade;
    }

    public DayOfWeek getDiaSemana() {
        return DayOfWeek.of(diaSemana);
    }

    public LocalTime getInicio() {
        return inicio;
    }

    public LocalTime getFim() {
        return fim;
    }

    public int getDuracaoMin() {
        return duracaoMin;
    }

    public Modalidade getModalidade() {
        return modalidade;
    }
}
