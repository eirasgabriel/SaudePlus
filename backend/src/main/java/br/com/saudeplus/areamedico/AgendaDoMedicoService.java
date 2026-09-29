package br.com.saudeplus.areamedico;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoCancelado;
import br.com.saudeplus.agendamentos.AgendamentoConfirmado;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.areamedico.dto.ConsultaResposta;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.AtualizarStatus;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.RegistrarAtendimento;
import br.com.saudeplus.areamedico.dto.RespostasDoMedico.ConsultaDetalhe;
import br.com.saudeplus.areamedico.dto.RespostasDoMedico.ConsultaDoPeriodo;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import jakarta.persistence.criteria.Predicate;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.UsuarioRepository;

/** Agenda do dia e o andamento de cada consulta, do ponto de vista do médico. */
@Service
public class AgendaDoMedicoService {

    static final int TAMANHO_MAXIMO = 100;
    /** Período máximo da lista de consultas. */
    static final int DIAS_MAXIMOS = 366;

    private final MedicoLogado medicoLogado;
    private final AgendamentoRepository agendamentos;
    private final ExameRepository exames;
    private final UsuarioRepository usuarios;
    private final ApplicationEventPublisher eventos;
    private final Clock relogio;

    public AgendaDoMedicoService(MedicoLogado medicoLogado, AgendamentoRepository agendamentos, ExameRepository exames,
            UsuarioRepository usuarios, ApplicationEventPublisher eventos, Clock relogio) {
        this.medicoLogado = medicoLogado;
        this.agendamentos = agendamentos;
        this.exames = exames;
        this.usuarios = usuarios;
        this.eventos = eventos;
        this.relogio = relogio;
    }

    /** `data` nula = hoje, no fuso de negócio. */
    @Transactional(readOnly = true)
    public List<ConsultaResposta> agendaDoDia(UsuarioAutenticado usuario, LocalDate data, StatusAgendamento filtro) {
        Medico medico = medicoLogado.de(usuario);
        return doDia(medico, data != null ? data : LocalDate.now(relogio)).stream()
                .filter(agendamento -> filtro == null || agendamento.getStatus() == filtro)
                .map(ConsultaResposta::de)
                .toList();
    }

    /**
     * Filtros da tela "Consultas". Sem `de`/`ate`, do mês passado ao próximo
     * (30 dias para cada lado de hoje). `recentes` inverte a ordem.
     */
    public record FiltroDeConsultas(LocalDate de, LocalDate ate, StatusAgendamento status, String paciente,
            boolean recentes) {
    }

    /** Consultas do médico num período, paginadas, com paciente, unidade e especialidade já carregados. */
    @Transactional(readOnly = true)
    public Pagina<ConsultaDoPeriodo> consultas(UsuarioAutenticado usuario, FiltroDeConsultas filtro, int pagina,
            int tamanho) {
        Medico medico = medicoLogado.de(usuario);
        LocalDate hoje = LocalDate.now(relogio);
        LocalDate de = filtro.de() != null ? filtro.de() : hoje.minusDays(30);
        LocalDate ate = filtro.ate() != null ? filtro.ate() : hoje.plusDays(30);
        if (ate.isBefore(de)) {
            throw new RequisicaoInvalidaException("Período inválido", "A data final vem antes da inicial.");
        }
        if (ChronoUnit.DAYS.between(de, ate) >= DIAS_MAXIMOS) {
            throw new RequisicaoInvalidaException("Período inválido", "Escolha um período de até um ano.");
        }
        Sort.Direction direcao = filtro.recentes() ? Sort.Direction.DESC : Sort.Direction.ASC;
        Page<Agendamento> encontradas = agendamentos.findAll(doMedicoNoPeriodo(medico.getId(), de, ate, filtro),
                PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO),
                        Sort.by(direcao, "data", "horario")));
        return Pagina.de(encontradas, ConsultaDoPeriodo::de);
    }

    /** Detalhe de uma consulta do médico, com os exames pedidos nela; de outro médico, 404. */
    @Transactional(readOnly = true)
    public ConsultaDetalhe detalhe(UsuarioAutenticado usuario, UUID agendamentoId) {
        Agendamento agendamento = doMedico(usuario, agendamentoId);
        return ConsultaDetalhe.de(agendamento, exames.findByAgendamentoOrigemIdOrderByCriadoEmAsc(agendamento.getId()));
    }

    private static Specification<Agendamento> doMedicoNoPeriodo(UUID medicoId, LocalDate de, LocalDate ate,
            FiltroDeConsultas filtro) {
        return (a, consulta, cb) -> {
            List<Predicate> regras = new ArrayList<>();
            regras.add(cb.equal(a.get("medico").get("id"), medicoId));
            regras.add(cb.between(a.get("data"), de, ate));
            if (filtro.status() != null) {
                regras.add(cb.equal(a.get("status"), filtro.status()));
            }
            if (filtro.paciente() != null && !filtro.paciente().isBlank()) {
                String padrao = "%" + filtro.paciente().strip().toLowerCase(Locale.ROOT).replace("%", "").replace("_", "") + "%";
                regras.add(cb.like(cb.lower(a.join("paciente").join("usuario").get("nomeCompleto")), padrao));
            }
            // A contagem da paginação não pode ter fetch join.
            if (consulta.getResultType() != Long.class && consulta.getResultType() != long.class) {
                a.fetch("paciente").fetch("usuario");
                a.fetch("unidade");
                a.fetch("especialidade");
            }
            return cb.and(regras.toArray(Predicate[]::new));
        };
    }

    @Transactional
    public ConsultaResposta mudarStatus(UsuarioAutenticado usuario, UUID agendamentoId, AtualizarStatus requisicao) {
        Agendamento agendamento = doMedico(usuario, agendamentoId);
        if (requisicao.status() == StatusAgendamento.CANCELADA) {
            String motivo = requisicao.motivo() == null || requisicao.motivo().isBlank()
                    ? "Cancelada pelo profissional."
                    : requisicao.motivo().strip();
            agendamento.cancelar(usuarios.getReferenceById(usuario.id()), motivo);
            eventos.publishEvent(new AgendamentoCancelado(agendamento.getId()));
        } else {
            agendamento.mudarStatus(requisicao.status());
            if (requisicao.status() == StatusAgendamento.CONFIRMADA) {
                eventos.publishEvent(new AgendamentoConfirmado(agendamento.getId()));
            }
        }
        return ConsultaResposta.de(agendamento);
    }

    @Transactional
    public ConsultaResposta registrarAtendimento(UsuarioAutenticado usuario, UUID agendamentoId,
            RegistrarAtendimento requisicao) {
        Agendamento agendamento = doMedico(usuario, agendamentoId);
        agendamento.registrarAtendimento(requisicao.resumo(), requisicao.desfecho());
        return ConsultaResposta.de(agendamento);
    }

    List<Agendamento> doDia(Medico medico, LocalDate data) {
        return agendamentos.findByMedicoIdAndDataOrderByHorario(medico.getId(), data);
    }

    /** Quantas consultas há em cada status, na ordem do enum (todas as chaves presentes). */
    static Map<String, Integer> contagemPorStatus(List<Agendamento> doDia) {
        Map<String, Integer> contagem = new LinkedHashMap<>();
        for (StatusAgendamento status : StatusAgendamento.values()) {
            contagem.put(status.chave(), (int) doDia.stream().filter(a -> a.getStatus() == status).count());
        }
        return contagem;
    }

    /** Agendamento de outro médico dá 404: a rota não revela que ele existe. */
    private Agendamento doMedico(UsuarioAutenticado usuario, UUID agendamentoId) {
        Medico medico = medicoLogado.de(usuario);
        return agendamentos.findByIdAndMedicoId(agendamentoId, medico.getId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Consulta", agendamentoId.toString()));
    }
}
