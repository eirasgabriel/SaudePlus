package br.com.saudeplus.exames;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Medico;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Exame pedido para um paciente, do pedido até o resultado. */
@Entity
@Table(name = "exames")
public class Exame extends EntidadeComId {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_solicitante_id")
    private Medico medicoSolicitante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tipo_exame_id", nullable = false)
    private TipoExame tipo;

    @Column(name = "agendamento_origem_id")
    private UUID agendamentoOrigemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id")
    private Unidade unidade;

    @Column(name = "data_hora")
    private Instant dataHora;

    /** Data-limite para o resultado sair. */
    private LocalDate prazo;

    @Column(nullable = false, length = 20)
    private StatusExame status = StatusExame.SOLICITADO;

    @Column(name = "resultado_path", length = 500)
    private String resultadoPath;

    @Column(name = "resultado_liberado_em")
    private Instant resultadoLiberadoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Exame() {
    }

    public Exame(Paciente paciente, Medico medicoSolicitante, TipoExame tipo, LocalDate prazo) {
        this.paciente = paciente;
        this.medicoSolicitante = medicoSolicitante;
        this.tipo = tipo;
        this.prazo = prazo;
    }

    /** Pedido feito a partir de uma consulta, para o histórico ligar os dois. */
    public void vincularConsulta(UUID agendamentoId) {
        agendamentoOrigemId = agendamentoId;
    }

    /** Marca (ou muda) a coleta. Só antes da análise começar. */
    public void agendar(Instant quando, Unidade onde) {
        if (status != StatusExame.SOLICITADO && status != StatusExame.AGENDADO) {
            throw new RegraDeNegocioException("Só é possível agendar um exame solicitado ou já agendado.");
        }
        dataHora = quando;
        unidade = onde;
        status = StatusExame.AGENDADO;
    }

    public void iniciarAnalise() {
        if (status != StatusExame.SOLICITADO && status != StatusExame.AGENDADO) {
            throw new RegraDeNegocioException("Só é possível pôr em análise um exame solicitado ou agendado.");
        }
        status = StatusExame.EM_ANALISE;
    }

    /**
     * Anexa o resultado e libera para o paciente. Liberar de novo substitui o
     * arquivo (correção de laudo); devolve a chave do arquivo anterior, se
     * havia, para quem chama removê-lo.
     */
    public String liberarResultado(String chaveDoArquivo, Instant momento) {
        if (status == StatusExame.CANCELADO) {
            throw new RegraDeNegocioException("Exame cancelado não recebe resultado.");
        }
        String anterior = resultadoPath;
        resultadoPath = chaveDoArquivo;
        resultadoLiberadoEm = momento;
        status = StatusExame.LIBERADO;
        return anterior;
    }

    public void cancelar() {
        if (status == StatusExame.LIBERADO) {
            throw new RegraDeNegocioException("Exame com resultado liberado não pode ser cancelado.");
        }
        status = StatusExame.CANCELADO;
    }

    public boolean resultadoDisponivel() {
        return status == StatusExame.LIBERADO && resultadoPath != null;
    }

    @PrePersist
    void aoCriar() {
        criadoEm = Instant.now();
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public Medico getMedicoSolicitante() {
        return medicoSolicitante;
    }

    public TipoExame getTipo() {
        return tipo;
    }

    public Unidade getUnidade() {
        return unidade;
    }

    public Instant getDataHora() {
        return dataHora;
    }

    public LocalDate getPrazo() {
        return prazo;
    }

    public StatusExame getStatus() {
        return status;
    }

    public String getResultadoPath() {
        return resultadoPath;
    }

    public UUID getAgendamentoOrigemId() {
        return agendamentoOrigemId;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getResultadoLiberadoEm() {
        return resultadoLiberadoEm;
    }
}
