package br.com.saudeplus.areamedico;

import java.time.Clock;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
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
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.UsuarioRepository;

/** Agenda do dia e o andamento de cada consulta, do ponto de vista do médico. */
@Service
public class AgendaDoMedicoService {

    private final MedicoLogado medicoLogado;
    private final AgendamentoRepository agendamentos;
    private final UsuarioRepository usuarios;
    private final ApplicationEventPublisher eventos;
    private final Clock relogio;

    public AgendaDoMedicoService(MedicoLogado medicoLogado, AgendamentoRepository agendamentos,
            UsuarioRepository usuarios, ApplicationEventPublisher eventos, Clock relogio) {
        this.medicoLogado = medicoLogado;
        this.agendamentos = agendamentos;
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
