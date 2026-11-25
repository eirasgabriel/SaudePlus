package br.com.saudeplus.agenda;

import java.time.DayOfWeek;
import java.time.LocalDate;
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
 * Janela de atendimento: "em 12/11/26, das 08:00 às 12:00, na unidade X,
 * consultas presenciais de 30 minutos". Os horários livres saem daqui, menos
 * bloqueios e agendamentos. As modalidades que um médico oferece são as das
 * suas disponibilidades.
 *
 * A janela vale num dia (`data`) ou toda semana (`diaSemana`, "às segundas");
 * cada janela tem exatamente um dos dois.
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

    /** Janela semanal. ISO-8601: 1 = segunda, 7 = domingo. Nulo nas janelas por data. */
    @Column(name = "dia_semana")
    private Short diaSemana;

    /** Dia da janela. Nulo nas janelas semanais. */
    @Column(name = "data")
    private LocalDate data;

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

    /** Janela semanal ("toda segunda"). */
    public Disponibilidade(Medico medico, Unidade unidade, DayOfWeek diaSemana, LocalTime inicio, LocalTime fim,
            int duracaoMin, Modalidade modalidade) {
        this.medico = medico;
        alterar(unidade, diaSemana, inicio, fim, duracaoMin, modalidade);
    }

    /** Janela num dia específico. */
    public Disponibilidade(Medico medico, Unidade unidade, LocalDate data, LocalTime inicio, LocalTime fim,
            int duracaoMin, Modalidade modalidade) {
        this.medico = medico;
        alterar(unidade, data, inicio, fim, duracaoMin, modalidade);
    }

    public void alterar(Unidade unidade, DayOfWeek diaSemana, LocalTime inicio, LocalTime fim, int duracaoMin,
            Modalidade modalidade) {
        this.diaSemana = (short) diaSemana.getValue();
        this.data = null;
        alterarHorario(unidade, inicio, fim, duracaoMin, modalidade);
    }

    public void alterar(Unidade unidade, LocalDate data, LocalTime inicio, LocalTime fim, int duracaoMin,
            Modalidade modalidade) {
        this.data = data;
        this.diaSemana = null;
        alterarHorario(unidade, inicio, fim, duracaoMin, modalidade);
    }

    private void alterarHorario(Unidade unidade, LocalTime inicio, LocalTime fim, int duracaoMin,
            Modalidade modalidade) {
        this.unidade = unidade;
        this.inicio = inicio;
        this.fim = fim;
        this.duracaoMin = (short) duracaoMin;
        this.modalidade = modalidade;
    }

    /**
     * As duas janelas podem cair no mesmo dia e se cruzam no horário. Uma
     * janela por data cruza com uma semanal do mesmo dia da semana.
     */
    public boolean sobrepoe(LocalDate outraData, DayOfWeek outroDia, LocalTime outroInicio, LocalTime outroFim) {
        boolean mesmoDia;
        if (data != null && outraData != null) {
            mesmoDia = data.equals(outraData);
        } else if (data != null) {
            mesmoDia = data.getDayOfWeek() == outroDia;
        } else if (outraData != null) {
            mesmoDia = getDiaSemana() == outraData.getDayOfWeek();
        } else {
            mesmoDia = getDiaSemana() == outroDia;
        }
        return mesmoDia && inicio.isBefore(outroFim) && outroInicio.isBefore(fim);
    }

    /** Janela por data que já passou: não gera mais horários. */
    public boolean passou(LocalDate hoje) {
        return data != null && data.isBefore(hoje);
    }

    public Medico getMedico() {
        return medico;
    }

    public Unidade getUnidade() {
        return unidade;
    }

    /** Dia da semana da janela semanal; null nas janelas por data. */
    public DayOfWeek getDiaSemana() {
        return diaSemana == null ? null : DayOfWeek.of(diaSemana);
    }

    public LocalDate getData() {
        return data;
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
