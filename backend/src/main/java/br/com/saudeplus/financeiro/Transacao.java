package br.com.saudeplus.financeiro;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import br.com.saudeplus.comum.EntidadeComId;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.pacientes.Paciente;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * Cobrança de um paciente: nasce pendente (consulta confirmada ou lançamento
 * manual) e termina paga ou estornada. A receita conta pela data do
 * pagamento (`pagoEm`), não pela do lançamento.
 */
@Entity
@Table(name = "transacoes")
public class Transacao extends EntidadeComId {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "agendamento_id")
    private UUID agendamentoId;

    @Column(nullable = false, length = 200)
    private String descricao;

    /** Só conhecida no pagamento (exceto convênio, que já nasce definido). */
    @Column(length = 20)
    private FormaPagamento forma;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false, length = 20)
    private StatusTransacao status = StatusTransacao.PENDENTE;

    /** Quando a cobrança foi lançada. */
    @Column(name = "data_hora", nullable = false)
    private Instant dataHora;

    @Column(name = "pago_em")
    private Instant pagoEm;

    @Column(name = "estornado_em")
    private Instant estornadoEm;

    @Column(nullable = false, length = 20)
    private OrigemTransacao origem = OrigemTransacao.MANUAL;

    /** Travamento otimista: pagar e estornar ao mesmo tempo não se sobrescrevem (409). */
    @Version
    @Column(nullable = false)
    private long versao;

    protected Transacao() {
    }

    public Transacao(Paciente paciente, UUID agendamentoId, String descricao, BigDecimal valor, FormaPagamento forma,
            Instant lancadaEm) {
        if (valor == null || valor.signum() < 0) {
            throw RequisicaoInvalidaException.noCampo("valor", "O valor não pode ser negativo.");
        }
        this.paciente = paciente;
        this.agendamentoId = agendamentoId;
        this.descricao = descricao.strip();
        this.valor = valor;
        this.forma = forma;
        this.dataHora = lancadaEm;
    }

    /**
     * Cobrança automática de uma consulta confirmada. O banco aceita só uma
     * ativa por consulta; o construtor comum é o lançamento manual.
     */
    public static Transacao daConsulta(Paciente paciente, UUID agendamentoId, String descricao, BigDecimal valor,
            FormaPagamento forma, Instant lancadaEm) {
        Transacao cobranca = new Transacao(paciente, agendamentoId, descricao, valor, forma, lancadaEm);
        cobranca.origem = OrigemTransacao.CONSULTA;
        return cobranca;
    }

    /** Registra o pagamento; a forma precisa ser conhecida até aqui. */
    public void pagar(FormaPagamento formaInformada, Instant momento) {
        mudarPara(StatusTransacao.PAGO);
        if (formaInformada != null) {
            forma = formaInformada;
        }
        if (forma == null) {
            throw RequisicaoInvalidaException.noCampo("forma", "Informe como foi pago.");
        }
        pagoEm = momento;
    }

    /** Devolve um pagamento ou anula uma cobrança pendente. */
    public void estornar(Instant momento) {
        mudarPara(StatusTransacao.ESTORNADO);
        estornadoEm = momento;
    }

    private void mudarPara(StatusTransacao novo) {
        if (!status.podeIrPara(novo)) {
            throw new RegraDeNegocioException("Não é possível passar a transação de \"%s\" para \"%s\"."
                    .formatted(status.rotulo(), novo.rotulo()));
        }
        status = novo;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public UUID getAgendamentoId() {
        return agendamentoId;
    }

    public String getDescricao() {
        return descricao;
    }

    public FormaPagamento getForma() {
        return forma;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public StatusTransacao getStatus() {
        return status;
    }

    public Instant getDataHora() {
        return dataHora;
    }

    public Instant getPagoEm() {
        return pagoEm;
    }

    public Instant getEstornadoEm() {
        return estornadoEm;
    }

    public OrigemTransacao getOrigem() {
        return origem;
    }
}
