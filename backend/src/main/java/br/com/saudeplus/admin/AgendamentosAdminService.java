package br.com.saudeplus.admin;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.admin.dto.AgendamentoAdminResposta;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.AlterarStatusDoAgendamento;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoCancelado;
import br.com.saudeplus.agendamentos.AgendamentoConfirmado;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.UsuarioRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

/**
 * Agendamentos de toda a rede, para a recepção e a gestão: lista com filtros,
 * números do período, calendário do mês e mudança de status (confirmar,
 * registrar chegada, cancelar...) com as mesmas regras de transição da agenda.
 */
@Service
public class AgendamentosAdminService {

    static final int TAMANHO_MAXIMO = 500;

    private final AgendamentoRepository agendamentos;
    private final ExameRepository exames;
    private final UsuarioRepository usuarios;
    private final ApplicationEventPublisher eventos;
    private final Auditoria auditoria;
    private final Clock relogio;

    public AgendamentosAdminService(AgendamentoRepository agendamentos, ExameRepository exames, UsuarioRepository usuarios,
            ApplicationEventPublisher eventos, Auditoria auditoria, Clock relogio) {
        this.agendamentos = agendamentos;
        this.exames = exames;
        this.usuarios = usuarios;
        this.eventos = eventos;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    /** Filtros opcionais; `q` procura no nome e CPF do paciente e no nome do médico. */
    public record Filtro(LocalDate de, LocalDate ate, StatusAgendamento status, UUID unidadeId, UUID medicoId,
            UUID especialidadeId, String termo) {
    }

    /** Totais do período por status (as chaves são as do `StatusAgendamento`). */
    public record Metricas(long total, Map<String, Long> porStatus) {
    }

    /** Dia do mês → quantos de cada tipo; só aparecem dias com alguma marcação. */
    public record Calendario(YearMonth mes, Map<Integer, Marcacoes> dias) {
    }

    public record Marcacoes(long consultas, long exames, long retornos, long cancelados) {
    }

    @Transactional(readOnly = true)
    public Pagina<AgendamentoAdminResposta> listar(Filtro filtro, int pagina, int tamanho) {
        Page<Agendamento> encontrados = agendamentos.findAll(especificacao(filtro),
                PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO),
                        Sort.by("data", "horario").and(Sort.by("id"))));
        return Pagina.de(encontrados, AgendamentoAdminResposta::de);
    }

    @Transactional(readOnly = true)
    public Metricas metricas(LocalDate de, LocalDate ate) {
        YearMonth mes = Periodos.mesAtual(relogio);
        LocalDate inicio = de != null ? de : Periodos.primeiroDia(mes);
        LocalDate fim = ate != null ? ate : Periodos.ultimoDia(mes);
        Map<String, Long> porStatus = new TreeMap<>();
        for (StatusAgendamento status : StatusAgendamento.values()) {
            porStatus.put(status.chave(), 0L);
        }
        long total = 0;
        for (Object[] linha : agendamentos.totaisPorStatus(inicio, fim)) {
            long quantidade = (Long) linha[1];
            porStatus.put(((StatusAgendamento) linha[0]).chave(), quantidade);
            total += quantidade;
        }
        return new Metricas(total, porStatus);
    }

    @Transactional(readOnly = true)
    public Calendario calendario(YearMonth pedido) {
        YearMonth mes = pedido != null ? pedido : Periodos.mesAtual(relogio);
        Map<Integer, long[]> dias = new TreeMap<>();
        for (Object[] linha : agendamentos.totaisPorDia(Periodos.primeiroDia(mes), Periodos.ultimoDia(mes))) {
            int dia = ((LocalDate) linha[0]).getDayOfMonth();
            TipoAtendimento tipo = (TipoAtendimento) linha[1];
            StatusAgendamento status = (StatusAgendamento) linha[2];
            long quantidade = (Long) linha[3];
            long[] contagem = dias.computeIfAbsent(dia, d -> new long[4]);
            if (status == StatusAgendamento.CANCELADA) {
                contagem[3] += quantidade;
            } else if (tipo == TipoAtendimento.RETORNO) {
                contagem[2] += quantidade;
            } else if (tipo == TipoAtendimento.EXAME) {
                contagem[1] += quantidade;
            } else {
                contagem[0] += quantidade;
            }
        }
        // Coletas de exame marcadas pela clínica também entram no calendário.
        for (var coleta : exames.coletasEntre(Periodos.inicio(mes, relogio), Periodos.fim(mes, relogio))) {
            int dia = LocalDateTime.ofInstant(coleta, relogio.getZone()).getDayOfMonth();
            dias.computeIfAbsent(dia, d -> new long[4])[1]++;
        }
        Map<Integer, Marcacoes> resultado = new TreeMap<>();
        dias.forEach((dia, c) -> resultado.put(dia, new Marcacoes(c[0], c[1], c[2], c[3])));
        return new Calendario(mes, resultado);
    }

    /** Mesmas transições da agenda; cancelar avisa o paciente. */
    @Transactional
    public AgendamentoAdminResposta alterarStatus(UsuarioAutenticado ator, UUID id, AlterarStatusDoAgendamento requisicao) {
        Agendamento agendamento = agendamentos.findCompletoById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Agendamento", id.toString()));
        if (requisicao.status() == StatusAgendamento.CANCELADA) {
            String motivo = requisicao.motivo() == null || requisicao.motivo().isBlank()
                    ? "Cancelada pela clínica."
                    : requisicao.motivo().strip();
            agendamento.cancelar(usuarios.getReferenceById(ator.id()), motivo);
            eventos.publishEvent(new AgendamentoCancelado(agendamento.getId()));
        } else {
            agendamento.mudarStatus(requisicao.status());
            if (requisicao.status() == StatusAgendamento.CONFIRMADA) {
                eventos.publishEvent(new AgendamentoConfirmado(agendamento.getId()));
            }
        }
        auditoria.registrar("agendamento.status", "agendamento", id, Map.of("status", requisicao.status().chave()));
        return AgendamentoAdminResposta.de(agendamento);
    }

    /** Também usada pelos relatórios, com os mesmos filtros. */
    static Specification<Agendamento> especificacao(Filtro filtro) {
        return (agendamento, consulta, cb) -> {
            List<Predicate> regras = new ArrayList<>();
            if (filtro.de() != null) {
                regras.add(cb.greaterThanOrEqualTo(agendamento.get("data"), filtro.de()));
            }
            if (filtro.ate() != null) {
                regras.add(cb.lessThanOrEqualTo(agendamento.get("data"), filtro.ate()));
            }
            if (filtro.status() != null) {
                regras.add(cb.equal(agendamento.get("status"), filtro.status()));
            }
            if (filtro.unidadeId() != null) {
                regras.add(cb.equal(agendamento.get("unidade").get("id"), filtro.unidadeId()));
            }
            if (filtro.medicoId() != null) {
                regras.add(cb.equal(agendamento.get("medico").get("id"), filtro.medicoId()));
            }
            if (filtro.especialidadeId() != null) {
                regras.add(cb.equal(agendamento.get("especialidade").get("id"), filtro.especialidadeId()));
            }
            if (filtro.termo() != null && !filtro.termo().isBlank()) {
                String padrao = "%" + filtro.termo().strip().toLowerCase(Locale.ROOT).replace("%", "").replace("_", "") + "%";
                var paciente = agendamento.join("paciente").join("usuario");
                var medico = agendamento.join("medico").join("usuario", JoinType.INNER);
                regras.add(cb.or(
                        cb.like(cb.lower(paciente.get("nomeCompleto")), padrao),
                        cb.like(paciente.get("cpf"), padrao),
                        cb.like(cb.lower(medico.get("nomeCompleto")), padrao)));
            }
            // Na listagem (não na contagem), carrega junto o que a resposta mostra.
            if (consulta.getResultType() != Long.class && consulta.getResultType() != long.class) {
                agendamento.fetch("paciente").fetch("usuario");
                agendamento.fetch("medico").fetch("usuario");
                agendamento.fetch("unidade");
                agendamento.fetch("especialidade");
            }
            return cb.and(regras.toArray(Predicate[]::new));
        };
    }
}
