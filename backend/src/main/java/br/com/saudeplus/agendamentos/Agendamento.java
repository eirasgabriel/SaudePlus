package br.com.saudeplus.agendamentos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.comum.EntidadeBase;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.usuarios.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * Horário reservado de um paciente com um médico. `data` e `horario` são
 * locais da unidade (fuso de negócio), não instantes.
 *
 * Toda mudança de status passa por {@link #mudarStatus}, que aplica as
 * transições de {@link StatusAgendamento}.
 */
@Entity
@Table(name = "agendamentos")
public class Agendamento extends EntidadeBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidade_id", nullable = false)
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "especialidade_id", nullable = false)
    private Especialidade especialidade;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalTime horario;

    @Column(name = "duracao_min", nullable = false)
    private short duracaoMin;

    @Column(nullable = false, length = 20)
    private TipoAtendimento tipo = TipoAtendimento.CONSULTA;

    @Column(nullable = false, length = 20)
    private Modalidade modalidade = Modalidade.PRESENCIAL;

    @Column(nullable = false, length = 20)
    private StatusAgendamento status = StatusAgendamento.PENDENTE;

    @Column(length = 300)
    private String motivo;

    @Column(columnDefinition = "text")
    private String resumo;

    @Column(columnDefinition = "text")
    private String desfecho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelado_por")
    private Usuario canceladoPor;

    @Column(name = "motivo_cancelamento", length = 300)
    private String motivoCancelamento;

    /** Travamento otimista: alterar a partir de uma versão velha falha (409). */
    @Version
    @Column(nullable = false)
    private long versao;

    protected Agendamento() {
    }

    public Agendamento(Paciente paciente, Medico medico, Unidade unidade, Especialidade especialidade,
            LocalDate data, LocalTime horario, int duracaoMin, TipoAtendimento tipo, Modalidade modalidade,
            String motivo) {
        this.paciente = paciente;
        this.medico = medico;
        this.unidade = unidade;
        this.especialidade = especialidade;
        this.data = data;
        this.horario = horario;
        this.duracaoMin = (short) duracaoMin;
        this.tipo = tipo;
        this.modalidade = modalidade;
        this.motivo = motivo == null || motivo.isBlank() ? null : motivo.strip();
    }

    /** Aplica uma transição de status; transição não permitida é regra de negócio (422). */
    public void mudarStatus(StatusAgendamento novo) {
        if (novo == status) {
            return;
        }
        if (!status.podeIrPara(novo)) {
            throw new RegraDeNegocioException("Não é possível passar a consulta de \"%s\" para \"%s\"."
                    .formatted(status.rotulo(), novo.rotulo()));
        }
        status = novo;
    }

    public void cancelar(Usuario quem, String motivoDoCancelamento) {
        mudarStatus(StatusAgendamento.CANCELADA);
        canceladoPor = quem;
        motivoCancelamento = motivoDoCancelamento;
    }

    /**
     * Registra o que aconteceu na consulta. Encerra a consulta em andamento;
     * numa já realizada, só corrige o registro.
     */
    public void registrarAtendimento(String resumoDoAtendimento, String desfechoDoAtendimento) {
        if (status != StatusAgendamento.EM_ANDAMENTO && status != StatusAgendamento.REALIZADA) {
            throw new RegraDeNegocioException("Só é possível registrar o atendimento de uma consulta em andamento ou realizada.");
        }
        resumo = resumoDoAtendimento.strip();
        desfecho = desfechoDoAtendimento == null || desfechoDoAtendimento.isBlank() ? null : desfechoDoAtendimento.strip();
        mudarStatus(StatusAgendamento.REALIZADA);
    }

    /** Pode ser cancelada ou remarcada: ainda não começou nem terminou. */
    public boolean alteravel() {
        return status == StatusAgendamento.PENDENTE || status == StatusAgendamento.CONFIRMADA;
    }

    /**
     * Muda para outro horário do mesmo médico. A consulta volta a `pendente`,
     * porque o novo horário ainda não foi confirmado pela clínica.
     */
    public void remarcar(LocalDate novaData, LocalTime novoHorario, Unidade novaUnidade, Modalidade novaModalidade,
            int novaDuracaoMin) {
        if (!alteravel()) {
            throw new RegraDeNegocioException("Só é possível remarcar uma consulta pendente ou confirmada.");
        }
        data = novaData;
        horario = novoHorario;
        unidade = novaUnidade;
        modalidade = novaModalidade;
        duracaoMin = (short) novaDuracaoMin;
        status = StatusAgendamento.PENDENTE;
    }

    public LocalDateTime inicio() {
        return LocalDateTime.of(data, horario);
    }

    public LocalDateTime fim() {
        return inicio().plusMinutes(duracaoMin);
    }

    /** Texto curto para listas: o motivo informado ou, sem ele, o tipo. */
    public String descricao() {
        return motivo != null ? motivo : tipo.rotulo();
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public Medico getMedico() {
        return medico;
    }

    public Unidade getUnidade() {
        return unidade;
    }

    public Especialidade getEspecialidade() {
        return especialidade;
    }

    public LocalDate getData() {
        return data;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public int getDuracaoMin() {
        return duracaoMin;
    }

    public TipoAtendimento getTipo() {
        return tipo;
    }

    public Modalidade getModalidade() {
        return modalidade;
    }

    public StatusAgendamento getStatus() {
        return status;
    }

    public String getMotivo() {
        return motivo;
    }

    public String getResumo() {
        return resumo;
    }

    public String getDesfecho() {
        return desfecho;
    }

    public Usuario getCanceladoPor() {
        return canceladoPor;
    }

    public String getMotivoCancelamento() {
        return motivoCancelamento;
    }
}
