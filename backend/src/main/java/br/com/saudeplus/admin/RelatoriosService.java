package br.com.saudeplus.admin;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.admin.AgendamentosAdminService.Filtro;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.comum.Exportacao.Tabela;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.pacientes.Paciente;

/**
 * Relatórios de atendimento: números do período (com o período anterior de
 * mesmo tamanho, para comparar), distribuições e as tabelas para exportar.
 *
 * Os filtros são os mesmos da lista de agendamentos. O período é limitado a
 * um ano: o cálculo é feito em memória sobre os agendamentos do período.
 */
@Service
public class RelatoriosService {

    static final int DIAS_MAXIMOS = 366;
    /** Até este tamanho, a evolução sai por dia; acima, por mês. */
    static final int DIAS_DA_SERIE_DIARIA = 62;

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    private static final String[] MESES = {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"};

    /** Tipos de exportação de `/api/admin/relatorios/exportar`. */
    public static final Set<String> TIPOS = Set.of("agendamentos", "atendimentos", "cancelamentos", "pacientes");

    private final AgendamentoRepository agendamentos;
    private final ExameRepository exames;
    private final Auditoria auditoria;
    private final Clock relogio;

    public RelatoriosService(AgendamentoRepository agendamentos, ExameRepository exames, Auditoria auditoria,
            Clock relogio) {
        this.agendamentos = agendamentos;
        this.exames = exames;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    public record Totais(long agendamentos, long atendimentos, long pacientes, long cancelamentos, long faltas) {
    }

    public record Item(String rotulo, long total) {
    }

    /** Ponto da evolução: `periodo` é a data (`2026-09-15`) ou o mês (`2026-09`). */
    public record Ponto(String rotulo, String periodo, long total) {
    }

    public record PorTipo(long consultas, long retornos, long exames) {
    }

    public record Resumo(LocalDate de, LocalDate ate, Totais totais, Totais anterior, PorTipo porTipo,
            List<Item> porEspecialidade, List<Ponto> evolucao, List<Item> faixaEtaria, List<Item> porUnidade,
            List<Item> porProfissional) {
    }

    /** Filtro com período padrão (últimos 30 dias até hoje) e validado. */
    public Filtro normalizar(Filtro filtro) {
        LocalDate fim = filtro.ate() != null ? filtro.ate() : LocalDate.now(relogio);
        LocalDate inicio = filtro.de() != null ? filtro.de() : fim.minusDays(29);
        if (fim.isBefore(inicio)) {
            throw new RequisicaoInvalidaException("Período inválido", "A data final vem antes da inicial.");
        }
        if (ChronoUnit.DAYS.between(inicio, fim) >= DIAS_MAXIMOS) {
            throw new RequisicaoInvalidaException("Período inválido", "Escolha um período de até um ano.");
        }
        return new Filtro(inicio, fim, filtro.status(), filtro.unidadeId(), filtro.medicoId(), filtro.especialidadeId(),
                filtro.termo());
    }

    @Transactional(readOnly = true)
    public Resumo resumo(Filtro pedido) {
        Filtro filtro = normalizar(pedido);
        long dias = ChronoUnit.DAYS.between(filtro.de(), filtro.ate()) + 1;
        Filtro anterior = new Filtro(filtro.de().minusDays(dias), filtro.de().minusDays(1), filtro.status(),
                filtro.unidadeId(), filtro.medicoId(), filtro.especialidadeId(), filtro.termo());
        List<Agendamento> doPeriodo = buscar(filtro);
        List<Agendamento> validos = doPeriodo.stream().filter(a -> a.getStatus() != StatusAgendamento.CANCELADA).toList();

        Map<TipoAtendimento, Long> porTipo = validos.stream()
                .collect(Collectors.groupingBy(Agendamento::getTipo, Collectors.counting()));
        long examesPedidos = exames.countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                instante(filtro.de()), instante(filtro.ate().plusDays(1)));

        return new Resumo(filtro.de(), filtro.ate(),
                totais(doPeriodo), totais(buscar(anterior)),
                new PorTipo(porTipo.getOrDefault(TipoAtendimento.CONSULTA, 0L),
                        porTipo.getOrDefault(TipoAtendimento.RETORNO, 0L),
                        porTipo.getOrDefault(TipoAtendimento.EXAME, 0L) + examesPedidos),
                contar(validos, a -> a.getEspecialidade().getNome()),
                evolucao(filtro, validos),
                faixaEtaria(validos),
                contar(validos, a -> a.getUnidade().getNome()),
                contar(validos, a -> a.getMedico().getUsuario().getNomeCompleto()));
    }

    /** Tabela para exportar. `tipo`: agendamentos, atendimentos, cancelamentos ou pacientes. */
    @Transactional(readOnly = true)
    public Tabela tabela(String tipo, Filtro pedido) {
        Filtro filtro = normalizar(pedido);
        List<Agendamento> lista = buscar(filtro);
        String periodo = "Período de %s a %s".formatted(filtro.de().format(DATA), filtro.ate().format(DATA));
        Tabela tabela = switch (tipo) {
            case "agendamentos" -> new Tabela("Relatório de agendamentos", periodo,
                    List.of("Data", "Hora", "Paciente", "CPF", "Especialidade", "Profissional", "Unidade", "Tipo", "Status"),
                    lista.stream().map(a -> List.of(a.getData().format(DATA), a.getHorario().format(HORA), nome(a.getPaciente()),
                            cpf(a.getPaciente()), a.getEspecialidade().getNome(), a.getMedico().getUsuario().getNomeCompleto(),
                            a.getUnidade().getNome(), a.getTipo().rotulo(), a.getStatus().rotulo())).toList());
            case "atendimentos" -> new Tabela("Relatório de atendimentos", periodo,
                    List.of("Data", "Hora", "Paciente", "Especialidade", "Profissional", "Unidade", "Desfecho"),
                    lista.stream().filter(a -> a.getStatus() == StatusAgendamento.REALIZADA)
                            .map(a -> List.of(a.getData().format(DATA), a.getHorario().format(HORA), nome(a.getPaciente()),
                                    a.getEspecialidade().getNome(), a.getMedico().getUsuario().getNomeCompleto(),
                                    a.getUnidade().getNome(), a.getDesfecho() == null ? "" : a.getDesfecho())).toList());
            case "cancelamentos" -> new Tabela("Relatório de cancelamentos", periodo,
                    List.of("Data", "Hora", "Paciente", "Profissional", "Unidade", "Status", "Motivo"),
                    lista.stream().filter(a -> !a.getStatus().ocupaHorario())
                            .map(a -> List.of(a.getData().format(DATA), a.getHorario().format(HORA), nome(a.getPaciente()),
                                    a.getMedico().getUsuario().getNomeCompleto(), a.getUnidade().getNome(),
                                    a.getStatus().rotulo(),
                                    a.getMotivoCancelamento() == null ? "" : a.getMotivoCancelamento())).toList());
            case "pacientes" -> tabelaDePacientes(lista, periodo);
            default -> throw new IllegalArgumentException("Relatório desconhecido: " + tipo);
        };
        auditoria.registrar("relatorio.exportar", "relatorio", null, Map.of("tipo", tipo, "linhas", tabela.linhas().size()));
        return tabela;
    }

    // ------------------------------------------------------------------ apoio

    private List<Agendamento> buscar(Filtro filtro) {
        return agendamentos.findAll(AgendamentosAdminService.especificacao(filtro), Sort.by("data", "horario"));
    }

    private static Totais totais(List<Agendamento> lista) {
        List<Agendamento> realizadas = lista.stream().filter(a -> a.getStatus() == StatusAgendamento.REALIZADA).toList();
        return new Totais(
                lista.size(),
                realizadas.size(),
                realizadas.stream().map(a -> a.getPaciente().getId()).distinct().count(),
                lista.stream().filter(a -> a.getStatus() == StatusAgendamento.CANCELADA).count(),
                lista.stream().filter(a -> a.getStatus() == StatusAgendamento.FALTOU).count());
    }

    private static List<Item> contar(List<Agendamento> lista, Function<Agendamento, String> chave) {
        return lista.stream().collect(Collectors.groupingBy(chave, Collectors.counting())).entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed().thenComparing(Map.Entry.comparingByKey()))
                .map(e -> new Item(e.getKey(), e.getValue()))
                .toList();
    }

    private static List<Ponto> evolucao(Filtro filtro, List<Agendamento> lista) {
        long dias = ChronoUnit.DAYS.between(filtro.de(), filtro.ate()) + 1;
        List<Ponto> pontos = new ArrayList<>();
        if (dias <= DIAS_DA_SERIE_DIARIA) {
            Map<LocalDate, Long> porDia = lista.stream().collect(Collectors.groupingBy(Agendamento::getData, Collectors.counting()));
            for (LocalDate dia = filtro.de(); !dia.isAfter(filtro.ate()); dia = dia.plusDays(1)) {
                pontos.add(new Ponto(dia.format(DateTimeFormatter.ofPattern("dd/MM")), dia.toString(), porDia.getOrDefault(dia, 0L)));
            }
        } else {
            Map<YearMonth, Long> porMes = lista.stream()
                    .collect(Collectors.groupingBy(a -> YearMonth.from(a.getData()), TreeMap::new, Collectors.counting()));
            for (YearMonth mes = YearMonth.from(filtro.de()); !mes.isAfter(YearMonth.from(filtro.ate())); mes = mes.plusMonths(1)) {
                pontos.add(new Ponto(MESES[mes.getMonthValue() - 1], mes.toString(), porMes.getOrDefault(mes, 0L)));
            }
        }
        return pontos;
    }

    /** Pacientes distintos atendidos no período, por idade na data da consulta. */
    private static List<Item> faixaEtaria(List<Agendamento> lista) {
        Map<UUID, Agendamento> umPorPaciente = lista.stream()
                .collect(Collectors.toMap(a -> a.getPaciente().getId(), Function.identity(), (a, b) -> a));
        Map<String, Long> faixas = new LinkedHashMap<>();
        for (String faixa : List.of("0 a 18 anos", "19 a 30 anos", "31 a 50 anos", "51 a 70 anos", "+ 70 anos", "Não informada")) {
            faixas.put(faixa, 0L);
        }
        umPorPaciente.values().forEach(a -> faixas.merge(faixa(a.getPaciente(), a.getData()), 1L, Long::sum));
        return faixas.entrySet().stream().map(e -> new Item(e.getKey(), e.getValue())).toList();
    }

    private static String faixa(Paciente paciente, LocalDate naData) {
        if (paciente.getDataNascimento() == null) {
            return "Não informada";
        }
        int idade = Period.between(paciente.getDataNascimento(), naData).getYears();
        if (idade <= 18) {
            return "0 a 18 anos";
        }
        if (idade <= 30) {
            return "19 a 30 anos";
        }
        if (idade <= 50) {
            return "31 a 50 anos";
        }
        return idade <= 70 ? "51 a 70 anos" : "+ 70 anos";
    }

    private static Tabela tabelaDePacientes(List<Agendamento> lista, String periodo) {
        Map<UUID, List<Agendamento>> porPaciente = lista.stream()
                .collect(Collectors.groupingBy(a -> a.getPaciente().getId(), LinkedHashMap::new, Collectors.toList()));
        List<List<String>> linhas = porPaciente.values().stream()
                .map(consultas -> {
                    Paciente p = consultas.getFirst().getPaciente();
                    Agendamento ultima = consultas.stream().max(Comparator.comparing(Agendamento::inicio)).orElseThrow();
                    Integer idade = p.idadeEm(ultima.getData());
                    return List.of(nome(p), cpf(p), idade == null ? "" : String.valueOf(idade),
                            p.getUsuario().getTelefone() == null ? "" : p.getUsuario().getTelefone(),
                            String.valueOf(consultas.size()),
                            String.valueOf(consultas.stream().filter(a -> a.getStatus() == StatusAgendamento.REALIZADA).count()),
                            ultima.getData().format(DATA));
                })
                .sorted(Comparator.comparing(linha -> linha.getFirst()))
                .toList();
        return new Tabela("Relatório de pacientes", periodo,
                List.of("Paciente", "CPF", "Idade", "Telefone", "Agendamentos", "Atendimentos", "Última consulta"), linhas);
    }

    private static String nome(Paciente paciente) {
        return paciente.getUsuario().getNomeCompleto();
    }

    private static String cpf(Paciente paciente) {
        return paciente.getUsuario().getCpf() == null ? "" : paciente.getUsuario().getCpf();
    }

    private Instant instante(LocalDate dia) {
        return dia.atStartOfDay(relogio.getZone()).toInstant();
    }
}
