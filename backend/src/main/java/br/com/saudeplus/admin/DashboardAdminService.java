package br.com.saudeplus.admin;

import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.admin.dto.AgendamentoAdminResposta;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.clinicas.StatusUnidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Tela inicial da administração numa chamada só. Todo número "do mês" vem com
 * o do mês anterior, para o front mostrar a variação sem outra requisição.
 */
@Service
public class DashboardAdminService {

    private static final int CLINICAS_NO_RANKING = 5;
    private static final int DIAS_DO_RANKING = 30;

    private final UsuarioRepository usuarios;
    private final UnidadeRepository unidades;
    private final AgendamentoRepository agendamentos;
    private final ExameRepository exames;
    private final NotificacaoService notificacoes;
    private final Clock relogio;

    public DashboardAdminService(UsuarioRepository usuarios, UnidadeRepository unidades,
            AgendamentoRepository agendamentos, ExameRepository exames, NotificacaoService notificacoes, Clock relogio) {
        this.usuarios = usuarios;
        this.unidades = unidades;
        this.agendamentos = agendamentos;
        this.exames = exames;
        this.notificacoes = notificacoes;
        this.relogio = relogio;
    }

    /** Valor do mês corrente e do anterior. */
    public record Comparativo(long atual, long anterior) {
    }

    public record Metricas(long usuariosCadastrados, Comparativo novosUsuarios, Comparativo agendamentos,
            long clinicasAtivas, Comparativo exames, Comparativo cancelamentos) {
    }

    /** `mes` no formato `2026-09`. */
    public record TotalDoMes(String mes, long total) {
    }

    /** Agendamentos do mês por tipo (sem cancelados) e exames pedidos no mês. */
    public record TiposDeAtendimento(long consultas, long retornos, long exames) {
    }

    public record ClinicaMovimentada(UUID id, String nome, String endereco, StatusUnidade status, long agendamentos) {
    }

    public record Dashboard(Metricas metricas, List<TotalDoMes> agendamentosPorMes, TiposDeAtendimento tiposDeAtendimento,
            List<ClinicaMovimentada> clinicasMaisAcessadas, List<AgendamentoAdminResposta> ultimosAgendamentos,
            List<NotificacaoResposta> notificacoes) {
    }

    /** `meses`: quantos meses (até o atual) o gráfico de agendamentos cobre. */
    @Transactional(readOnly = true)
    public Dashboard montar(UsuarioAutenticado usuario, int meses) {
        YearMonth atual = Periodos.mesAtual(relogio);
        YearMonth anterior = atual.minusMonths(1);
        return new Dashboard(
                metricas(atual, anterior),
                porMes(atual, Math.clamp(meses, 1, 24)),
                tipos(atual),
                clinicasMaisAcessadas(),
                agendamentos.findTop5ByOrderByCriadoEmDesc().stream().map(AgendamentoAdminResposta::de).toList(),
                notificacoes.doUsuario(usuario.id()));
    }

    private Metricas metricas(YearMonth atual, YearMonth anterior) {
        return new Metricas(
                usuarios.count(),
                new Comparativo(novosUsuarios(atual), novosUsuarios(anterior)),
                new Comparativo(agendamentosNoMes(atual), agendamentosNoMes(anterior)),
                unidades.countByStatus(StatusUnidade.ATIVA),
                new Comparativo(examesNoMes(atual), examesNoMes(anterior)),
                new Comparativo(canceladosNoMes(atual), canceladosNoMes(anterior)));
    }

    private long novosUsuarios(YearMonth mes) {
        return usuarios.countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(Periodos.inicio(mes, relogio), Periodos.fim(mes, relogio));
    }

    private long agendamentosNoMes(YearMonth mes) {
        return agendamentos.totaisPorStatus(Periodos.primeiroDia(mes), Periodos.ultimoDia(mes)).stream()
                .mapToLong(linha -> (Long) linha[1]).sum();
    }

    private long canceladosNoMes(YearMonth mes) {
        return agendamentos.totaisPorStatus(Periodos.primeiroDia(mes), Periodos.ultimoDia(mes)).stream()
                .filter(linha -> linha[0] == StatusAgendamento.CANCELADA)
                .mapToLong(linha -> (Long) linha[1]).sum();
    }

    private long examesNoMes(YearMonth mes) {
        return exames.countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(Periodos.inicio(mes, relogio), Periodos.fim(mes, relogio));
    }

    /** Um ponto por mês, inclusive os meses sem nenhum agendamento. */
    private List<TotalDoMes> porMes(YearMonth atual, int meses) {
        YearMonth primeiro = atual.minusMonths(meses - 1L);
        Map<YearMonth, Long> totais = new HashMap<>();
        for (Object[] linha : agendamentos.totaisPorMes(Periodos.primeiroDia(primeiro), Periodos.ultimoDia(atual))) {
            totais.put(YearMonth.of(((Number) linha[0]).intValue(), ((Number) linha[1]).intValue()), (Long) linha[2]);
        }
        List<TotalDoMes> pontos = new ArrayList<>();
        for (YearMonth mes = primeiro; !mes.isAfter(atual); mes = mes.plusMonths(1)) {
            pontos.add(new TotalDoMes(mes.toString(), totais.getOrDefault(mes, 0L)));
        }
        return pontos;
    }

    private TiposDeAtendimento tipos(YearMonth mes) {
        Map<TipoAtendimento, Long> porTipo = new HashMap<>();
        for (Object[] linha : agendamentos.totaisPorTipo(Periodos.primeiroDia(mes), Periodos.ultimoDia(mes))) {
            porTipo.put((TipoAtendimento) linha[0], (Long) linha[1]);
        }
        return new TiposDeAtendimento(
                porTipo.getOrDefault(TipoAtendimento.CONSULTA, 0L),
                porTipo.getOrDefault(TipoAtendimento.RETORNO, 0L),
                porTipo.getOrDefault(TipoAtendimento.EXAME, 0L) + examesNoMes(mes));
    }

    /** As unidades com mais agendamentos nos últimos 30 dias. */
    private List<ClinicaMovimentada> clinicasMaisAcessadas() {
        LocalDate hoje = LocalDate.now(relogio);
        List<Object[]> ranking = agendamentos.totaisPorUnidade(hoje.minusDays(DIAS_DO_RANKING), hoje).stream()
                .limit(CLINICAS_NO_RANKING).toList();
        Map<UUID, Unidade> porId = unidades.findAllById(ranking.stream().map(linha -> (UUID) linha[0]).toList()).stream()
                .collect(Collectors.toMap(Unidade::getId, Function.identity()));
        return ranking.stream()
                .filter(linha -> porId.containsKey((UUID) linha[0]))
                .map(linha -> {
                    Unidade u = porId.get((UUID) linha[0]);
                    String rua = u.getBairro() == null ? u.getEndereco() : u.getEndereco() + " – " + u.getBairro();
                    return new ClinicaMovimentada(u.getId(), u.getNome(), "%s, %s - %s".formatted(rua, u.getCidade(), u.getUf()),
                            u.getStatus(), (Long) linha[1]);
                })
                .toList();
    }
}
