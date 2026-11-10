package br.com.saudeplus.agenda;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agenda.CalculadoraDeHorarios.Bloqueio;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.HorarioLivre;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.Janela;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.Ocupado;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.exception.RequisicaoInvalidaException;

/**
 * Horários livres de médicos. Busca os dados de todos os médicos pedidos em
 * lote (três consultas no total) e entrega a {@link CalculadoraDeHorarios}.
 */
@Service
public class AgendaService {

    private final DisponibilidadeRepository disponibilidades;
    private final BloqueioAgendaRepository bloqueios;
    private final AgendamentoRepository agendamentos;
    private final RegrasDaAgenda regras;
    private final Clock relogio;

    public AgendaService(DisponibilidadeRepository disponibilidades, BloqueioAgendaRepository bloqueios,
            AgendamentoRepository agendamentos, RegrasDaAgenda regras, Clock relogio) {
        this.disponibilidades = disponibilidades;
        this.bloqueios = bloqueios;
        this.agendamentos = agendamentos;
        this.regras = regras;
        this.relogio = relogio;
    }

    public ZoneId fuso() {
        return relogio.getZone();
    }

    public LocalDate hoje() {
        return LocalDate.now(relogio);
    }

    /** Horários livres de um médico entre duas datas (inclusive). */
    @Transactional(readOnly = true)
    public List<HorarioLivre> horariosLivres(UUID medicoId, LocalDate de, LocalDate ate) {
        LocalDate hoje = hoje();
        LocalDate inicio = de == null || de.isBefore(hoje) ? hoje : de;
        LocalDate fim = ate == null ? inicio.plusDays(13) : ate;
        if (fim.isBefore(inicio)) {
            throw new RequisicaoInvalidaException("Período inválido", "A data final vem antes da inicial.");
        }
        LocalDate limite = hoje.plusDays(regras.atuais().janelaMaximaDias());
        if (inicio.isAfter(limite)) {
            return List.of();
        }
        return calcular(List.of(medicoId), inicio, fim.isAfter(limite) ? limite : fim).getOrDefault(medicoId, List.of());
    }

    /**
     * Para cada médico, os primeiros horários livres do primeiro dia que tiver
     * algum, procurando até `diasAFrente` dias. Alimenta o cartão da busca.
     */
    @Transactional(readOnly = true)
    public Map<UUID, List<HorarioLivre>> proximosHorarios(Collection<UUID> medicoIds, int diasAFrente, int quantidade) {
        if (medicoIds.isEmpty()) {
            return Map.of();
        }
        LocalDate hoje = hoje();
        Map<UUID, List<HorarioLivre>> todos = calcular(medicoIds, hoje, hoje.plusDays(diasAFrente));
        Map<UUID, List<HorarioLivre>> proximos = new HashMap<>();
        todos.forEach((medicoId, livres) -> {
            if (!livres.isEmpty()) {
                LocalDate primeiroDia = livres.getFirst().data();
                proximos.put(medicoId, livres.stream()
                        .filter(livre -> livre.data().equals(primeiroDia))
                        .limit(quantidade)
                        .toList());
            }
        });
        return proximos;
    }

    /** O horário está entre os livres do médico (conferência antes de reservar). */
    @Transactional(readOnly = true)
    public boolean estaLivre(UUID medicoId, LocalDate data, LocalTime horario) {
        return horariosLivres(medicoId, data, data).stream().anyMatch(livre -> livre.horario().equals(horario));
    }

    private Map<UUID, List<HorarioLivre>> calcular(Collection<UUID> medicoIds, LocalDate de, LocalDate ate) {
        ZoneId fuso = relogio.getZone();
        Map<UUID, List<Janela>> janelas = disponibilidades.findByMedicoIdIn(medicoIds).stream()
                .filter(d -> d.getUnidade().ativa())
                .collect(Collectors.groupingBy(d -> d.getMedico().getId(), Collectors.mapping(
                        d -> new Janela(d.getDiaSemana(), d.getInicio(), d.getFim(), d.getDuracaoMin(),
                                d.getUnidade().getId(), d.getModalidade()),
                        Collectors.toList())));
        Map<UUID, List<Ocupado>> ocupados = agendamentos
                .ocupacoes(medicoIds, de, ate, StatusAgendamento.queOcupamHorario()).stream()
                .collect(Collectors.groupingBy(Ocupacao::medicoId, Collectors.mapping(
                        o -> new Ocupado(o.data(), o.inicio(), o.duracaoMin()), Collectors.toList())));
        Map<UUID, List<Bloqueio>> bloqueados = bloqueios
                .queTocam(medicoIds, de.atStartOfDay(fuso).toInstant(), ate.plusDays(1).atStartOfDay(fuso).toInstant())
                .stream()
                .collect(Collectors.groupingBy(b -> b.getMedico().getId(), Collectors.mapping(
                        b -> new Bloqueio(LocalDateTime.ofInstant(b.getInicio(), fuso),
                                LocalDateTime.ofInstant(b.getFim(), fuso)),
                        Collectors.toList())));

        LocalDateTime inicioMinimo = LocalDateTime.now(relogio).plus(regras.atuais().antecedenciaMinima());
        Map<UUID, List<HorarioLivre>> resultado = new LinkedHashMap<>();
        for (UUID medicoId : medicoIds) {
            resultado.put(medicoId, CalculadoraDeHorarios.calcular(de, ate,
                    janelas.getOrDefault(medicoId, List.of()),
                    ocupados.getOrDefault(medicoId, List.of()),
                    bloqueados.getOrDefault(medicoId, List.of()),
                    inicioMinimo));
        }
        return resultado;
    }
}
