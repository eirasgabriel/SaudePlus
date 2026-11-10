package br.com.saudeplus.financeiro;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.comum.Exportacao.Tabela;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import jakarta.persistence.criteria.Predicate;

/**
 * Financeiro da rede: cobranças, pagamentos e estornos. As cobranças de
 * consulta nascem sozinhas (ver `CobrancaDeConsultas`); aqui ficam a
 * consulta, os lançamentos manuais, a baixa de pagamento e o estorno.
 */
@Service
public class FinanceiroService {

    static final int TAMANHO_MAXIMO = 500;
    /** Período máximo de consulta e exportação. */
    static final int DIAS_MAXIMOS = 366;

    private static final DateTimeFormatter DATA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final TransacaoRepository transacoes;
    private final PacienteRepository pacientes;
    private final AgendamentoRepository agendamentos;
    private final FormasDePagamentoService formas;
    private final Auditoria auditoria;
    private final Clock relogio;

    public FinanceiroService(TransacaoRepository transacoes, PacienteRepository pacientes,
            AgendamentoRepository agendamentos, FormasDePagamentoService formas, Auditoria auditoria, Clock relogio) {
        this.transacoes = transacoes;
        this.pacientes = pacientes;
        this.agendamentos = agendamentos;
        this.formas = formas;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    // ---------------------------------------------------------------- respostas

    public record Pessoa(UUID id, String nome, String cpf) {
    }

    /**
     * @param dataHora quando a cobrança foi lançada
     * @param pagoEm quando foi paga (nulo se não foi)
     */
    public record TransacaoResposta(UUID id, Instant dataHora, Instant pagoEm, Instant estornadoEm, Pessoa paciente,
            UUID agendamentoId, String descricao, FormaPagamento forma, BigDecimal valor, StatusTransacao status) {

        static TransacaoResposta de(Transacao t) {
            var usuario = t.getPaciente().getUsuario();
            return new TransacaoResposta(t.getId(), t.getDataHora(), t.getPagoEm(), t.getEstornadoEm(),
                    new Pessoa(t.getPaciente().getId(), usuario.getNomeCompleto(), usuario.getCpf()),
                    t.getAgendamentoId(), t.getDescricao(), t.getForma(), t.getValor(), t.getStatus());
        }
    }

    public record Comparativo(BigDecimal atual, BigDecimal anterior) {
    }

    public record Contagem(long atual, long anterior) {
    }

    public record PorForma(FormaPagamento forma, String rotulo, BigDecimal total, int percentual) {
    }

    /** Um dia do período: o que foi lançado (pago + pendente) e o que foi recebido. */
    public record Dia(LocalDate data, BigDecimal faturado, BigDecimal recebido) {
    }

    /**
     * Números do período. "Anterior" é o período de mesmo tamanho logo antes.
     *
     * @param faturado cobranças lançadas no período, sem as anuladas
     * @param recebido pagamentos recebidos no período (pela data do pagamento)
     * @param emAberto tudo o que está pendente hoje, de qualquer data
     * @param estornado devoluções de pagamentos feitas no período
     */
    public record Resumo(LocalDate de, LocalDate ate, Comparativo faturado, Comparativo recebido, Contagem pagamentos,
            Contagem consultasPagas, BigDecimal emAberto, long cobrancasEmAberto, BigDecimal estornado,
            List<PorForma> porForma, List<Dia> evolucao) {
    }

    // ---------------------------------------------------------------- consulta

    public record Filtro(LocalDate de, LocalDate ate, StatusTransacao status, FormaPagamento forma, String termo) {
    }

    @Transactional(readOnly = true)
    public Pagina<TransacaoResposta> listar(Filtro filtro, int pagina, int tamanho) {
        Page<Transacao> encontradas = transacoes.findAll(especificacao(filtro),
                PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO),
                        Sort.by(Sort.Order.desc("dataHora"), Sort.Order.desc("id"))));
        return Pagina.de(encontradas, TransacaoResposta::de);
    }

    /** `de`/`ate` opcionais: padrão, os últimos 7 dias até hoje. */
    @Transactional(readOnly = true)
    public Resumo resumo(LocalDate de, LocalDate ate) {
        LocalDate fim = ate != null ? ate : LocalDate.now(relogio);
        LocalDate inicio = de != null ? de : fim.minusDays(6);
        validarPeriodo(inicio, fim);
        long dias = ChronoUnit.DAYS.between(inicio, fim) + 1;
        LocalDate inicioAnterior = inicio.minusDays(dias);
        LocalDate fimAnterior = inicio.minusDays(1);

        List<Transacao> pagas = transacoes.pagasEntre(instante(inicio), instante(fim.plusDays(1)));
        List<Transacao> pagasAntes = transacoes.pagasEntre(instante(inicioAnterior), instante(fimAnterior.plusDays(1)));
        List<Transacao> lancadas = naoAnuladas(transacoes.lancadasEntre(instante(inicio), instante(fim.plusDays(1))));
        List<Transacao> lancadasAntes = naoAnuladas(
                transacoes.lancadasEntre(instante(inicioAnterior), instante(fimAnterior.plusDays(1))));
        List<Transacao> abertas = transacoes.findByStatus(StatusTransacao.PENDENTE);
        BigDecimal devolvido = soma(transacoes.estornadasEntre(instante(inicio), instante(fim.plusDays(1))).stream()
                .filter(t -> t.getPagoEm() != null).toList());

        return new Resumo(inicio, fim,
                new Comparativo(soma(lancadas), soma(lancadasAntes)),
                new Comparativo(soma(pagas), soma(pagasAntes)),
                new Contagem(pagas.size(), pagasAntes.size()),
                new Contagem(pagas.stream().filter(t -> t.getAgendamentoId() != null).count(),
                        pagasAntes.stream().filter(t -> t.getAgendamentoId() != null).count()),
                soma(abertas), abertas.size(), devolvido,
                porForma(pagas),
                evolucao(inicio, fim, lancadas, pagas));
    }

    // ---------------------------------------------------------------- ações

    public record Lancar(UUID pacienteId, UUID agendamentoId, String descricao, BigDecimal valor, FormaPagamento forma,
            boolean jaPago) {
    }

    /** Lançamento manual (exame particular, taxa...). Já pago exige a forma. */
    @Transactional
    public TransacaoResposta lancar(Lancar dados) {
        Paciente paciente = pacientes.findById(dados.pacienteId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Paciente", dados.pacienteId().toString()));
        if (dados.agendamentoId() != null && agendamentos.findById(dados.agendamentoId())
                .filter(a -> a.getPaciente().getId().equals(paciente.getId())).isEmpty()) {
            throw new RegraDeNegocioException("A consulta informada não é deste paciente.");
        }
        Transacao nova = new Transacao(paciente, dados.agendamentoId(), dados.descricao(), dados.valor(), dados.forma(),
                relogio.instant());
        if (dados.jaPago()) {
            formas.exigirAtiva(dados.forma());
            nova.pagar(dados.forma(), relogio.instant());
        }
        transacoes.save(nova);
        auditoria.registrar("financeiro.lancar", "transacao", nova.getId(),
                Map.of("valor", nova.getValor(), "status", nova.getStatus().chave()));
        return TransacaoResposta.de(nova);
    }

    /** Baixa de pagamento (`pago`, com a forma) ou estorno (`estornado`). */
    @Transactional
    public TransacaoResposta alterarStatus(UUID id, StatusTransacao novo, FormaPagamento forma) {
        Transacao transacao = transacoes.findCompletaById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Transação", id.toString()));
        switch (novo) {
            case PAGO -> {
                formas.exigirAtiva(forma);
                transacao.pagar(forma, relogio.instant());
            }
            case ESTORNADO -> transacao.estornar(relogio.instant());
            case PENDENTE -> throw new RegraDeNegocioException("Uma transação não volta a ficar pendente.");
        }
        auditoria.registrar("financeiro.status", "transacao", id, Map.of("status", novo.chave(), "valor", transacao.getValor()));
        return TransacaoResposta.de(transacao);
    }

    @Transactional(readOnly = true)
    public List<TransacaoResposta> doPaciente(UUID pacienteId) {
        return transacoes.findByPacienteIdOrderByDataHoraDesc(pacienteId).stream().map(TransacaoResposta::de).toList();
    }

    // ---------------------------------------------------------------- exportação

    @Transactional(readOnly = true)
    public Tabela tabela(Filtro filtro) {
        LocalDate fim = filtro.ate() != null ? filtro.ate() : LocalDate.now(relogio);
        LocalDate inicio = filtro.de() != null ? filtro.de() : fim.minusDays(29);
        validarPeriodo(inicio, fim);
        Filtro comPeriodo = new Filtro(inicio, fim, filtro.status(), filtro.forma(), filtro.termo());
        List<Transacao> linhas = transacoes.findAll(especificacao(comPeriodo), Sort.by("dataHora"));
        NumberFormat moeda = NumberFormat.getCurrencyInstance(Locale.of("pt", "BR"));
        ZoneId fuso = relogio.getZone();
        Function<Instant, String> data = i -> i == null ? "" : LocalDateTime.ofInstant(i, fuso).format(DATA_HORA);
        List<List<String>> conteudo = new ArrayList<>();
        for (Transacao t : linhas) {
            var usuario = t.getPaciente().getUsuario();
            conteudo.add(List.of(data.apply(t.getDataHora()), usuario.getNomeCompleto(),
                    usuario.getCpf() == null ? "" : usuario.getCpf(), t.getDescricao(),
                    t.getForma() == null ? "" : t.getForma().rotulo(), moeda.format(t.getValor()),
                    t.getStatus().rotulo(), data.apply(t.getPagoEm())));
        }
        auditoria.registrar("relatorio.exportar", "relatorio", null, Map.of("tipo", "financeiro", "linhas", linhas.size()));
        return new Tabela("Relatório financeiro",
                "Lançamentos de %s a %s".formatted(inicio.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                        fim.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))),
                List.of("Lançado em", "Paciente", "CPF", "Descrição", "Forma", "Valor", "Status", "Pago em"),
                conteudo);
    }

    // ---------------------------------------------------------------- apoio

    private Specification<Transacao> especificacao(Filtro filtro) {
        return (t, consulta, cb) -> {
            List<Predicate> regras = new ArrayList<>();
            if (filtro.de() != null) {
                regras.add(cb.greaterThanOrEqualTo(t.get("dataHora"), instante(filtro.de())));
            }
            if (filtro.ate() != null) {
                regras.add(cb.lessThan(t.get("dataHora"), instante(filtro.ate().plusDays(1))));
            }
            if (filtro.status() != null) {
                regras.add(cb.equal(t.get("status"), filtro.status()));
            }
            if (filtro.forma() != null) {
                regras.add(cb.equal(t.get("forma"), filtro.forma()));
            }
            var usuario = t.join("paciente").join("usuario");
            if (filtro.termo() != null && !filtro.termo().isBlank()) {
                String padrao = "%" + filtro.termo().strip().toLowerCase(Locale.ROOT).replace("%", "").replace("_", "") + "%";
                regras.add(cb.or(cb.like(cb.lower(usuario.get("nomeCompleto")), padrao),
                        cb.like(cb.lower(t.get("descricao")), padrao)));
            }
            if (consulta.getResultType() != Long.class && consulta.getResultType() != long.class) {
                t.fetch("paciente").fetch("usuario");
            }
            return cb.and(regras.toArray(Predicate[]::new));
        };
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio)) {
            throw new RequisicaoInvalidaException("Período inválido", "A data final vem antes da inicial.");
        }
        if (ChronoUnit.DAYS.between(inicio, fim) >= DIAS_MAXIMOS) {
            throw new RequisicaoInvalidaException("Período inválido", "Escolha um período de até um ano.");
        }
    }

    private Instant instante(LocalDate dia) {
        return dia.atStartOfDay(relogio.getZone()).toInstant();
    }

    private static List<Transacao> naoAnuladas(List<Transacao> lista) {
        return lista.stream().filter(t -> !(t.getStatus() == StatusTransacao.ESTORNADO && t.getPagoEm() == null)).toList();
    }

    private static BigDecimal soma(List<Transacao> lista) {
        return lista.stream().map(Transacao::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static List<PorForma> porForma(List<Transacao> pagas) {
        Map<FormaPagamento, BigDecimal> totais = new EnumMap<>(FormaPagamento.class);
        pagas.forEach(t -> totais.merge(t.getForma(), t.getValor(), BigDecimal::add));
        BigDecimal geral = soma(pagas);
        return totais.entrySet().stream()
                .sorted(Map.Entry.<FormaPagamento, BigDecimal>comparingByValue().reversed())
                .map(e -> new PorForma(e.getKey(), e.getKey().rotulo(), e.getValue(), geral.signum() == 0 ? 0
                        : e.getValue().multiply(BigDecimal.valueOf(100)).divide(geral, 0, RoundingMode.HALF_UP).intValue()))
                .toList();
    }

    private List<Dia> evolucao(LocalDate inicio, LocalDate fim, List<Transacao> lancadas, List<Transacao> pagas) {
        ZoneId fuso = relogio.getZone();
        Map<LocalDate, BigDecimal[]> dias = new LinkedHashMap<>();
        for (LocalDate dia = inicio; !dia.isAfter(fim); dia = dia.plusDays(1)) {
            dias.put(dia, new BigDecimal[] {BigDecimal.ZERO, BigDecimal.ZERO});
        }
        lancadas.forEach(t -> dias.computeIfPresent(LocalDate.ofInstant(t.getDataHora(), fuso), (d, v) -> {
            v[0] = v[0].add(t.getValor());
            return v;
        }));
        pagas.forEach(t -> dias.computeIfPresent(LocalDate.ofInstant(t.getPagoEm(), fuso), (d, v) -> {
            v[1] = v[1].add(t.getValor());
            return v;
        }));
        return dias.entrySet().stream().map(e -> new Dia(e.getKey(), e.getValue()[0], e.getValue()[1])).toList();
    }
}
