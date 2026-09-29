package br.com.saudeplus.areamedico;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agenda.BloqueioAgenda;
import br.com.saudeplus.agenda.BloqueioAgendaRepository;
import br.com.saudeplus.agenda.Disponibilidade;
import br.com.saudeplus.agenda.DisponibilidadeRepository;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoCancelado;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.areamedico.dto.AgendaConfiguradaResposta.BloqueioResposta;
import br.com.saudeplus.areamedico.dto.AgendaConfiguradaResposta.DisponibilidadeResposta;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.CriarBloqueio;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.SalvarDisponibilidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.exception.ConflitoException;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * O médico monta a própria agenda: janelas semanais de atendimento e
 * bloqueios (férias, folgas). Agendamentos já feitos não mudam quando uma
 * janela muda; um bloqueio sobre consultas marcadas exige confirmação.
 */
@Service
public class ConfiguracaoDeAgendaService {

    private final MedicoLogado medicoLogado;
    private final DisponibilidadeRepository disponibilidades;
    private final BloqueioAgendaRepository bloqueios;
    private final AgendamentoRepository agendamentos;
    private final UsuarioRepository usuarios;
    private final ApplicationEventPublisher eventos;
    private final Clock relogio;

    public ConfiguracaoDeAgendaService(MedicoLogado medicoLogado, DisponibilidadeRepository disponibilidades,
            BloqueioAgendaRepository bloqueios, AgendamentoRepository agendamentos, UsuarioRepository usuarios,
            ApplicationEventPublisher eventos, Clock relogio) {
        this.medicoLogado = medicoLogado;
        this.disponibilidades = disponibilidades;
        this.bloqueios = bloqueios;
        this.agendamentos = agendamentos;
        this.usuarios = usuarios;
        this.eventos = eventos;
        this.relogio = relogio;
    }

    // ------------------------------------------------------------------ janelas

    @Transactional(readOnly = true)
    public List<DisponibilidadeResposta> disponibilidades(UsuarioAutenticado usuario) {
        Medico medico = medicoLogado.de(usuario);
        return disponibilidades.findByMedicoIdOrderByDiaSemanaAscInicioAsc(medico.getId()).stream()
                .map(DisponibilidadeResposta::de)
                .toList();
    }

    @Transactional
    public DisponibilidadeResposta criarDisponibilidade(UsuarioAutenticado usuario, SalvarDisponibilidade requisicao) {
        Medico medico = medicoLogado.de(usuario);
        Unidade unidade = validar(medico, requisicao, null);
        Disponibilidade nova = disponibilidades.save(new Disponibilidade(medico, unidade,
                DayOfWeek.of(requisicao.diaSemana()), requisicao.inicio(), requisicao.fim(), requisicao.duracaoMin(),
                requisicao.modalidade()));
        return DisponibilidadeResposta.de(nova);
    }

    @Transactional
    public DisponibilidadeResposta alterarDisponibilidade(UsuarioAutenticado usuario, UUID id,
            SalvarDisponibilidade requisicao) {
        Medico medico = medicoLogado.de(usuario);
        Disponibilidade existente = disponibilidadeDoMedico(medico, id);
        Unidade unidade = validar(medico, requisicao, id);
        existente.alterar(unidade, DayOfWeek.of(requisicao.diaSemana()), requisicao.inicio(), requisicao.fim(),
                requisicao.duracaoMin(), requisicao.modalidade());
        return DisponibilidadeResposta.de(existente);
    }

    @Transactional
    public void removerDisponibilidade(UsuarioAutenticado usuario, UUID id) {
        Medico medico = medicoLogado.de(usuario);
        disponibilidades.delete(disponibilidadeDoMedico(medico, id));
    }

    private Unidade validar(Medico medico, SalvarDisponibilidade requisicao, UUID ignorar) {
        if (!requisicao.inicio().isBefore(requisicao.fim())) {
            throw RequisicaoInvalidaException.noCampo("fim", "O fim precisa ser depois do início.");
        }
        if (Duration.between(requisicao.inicio(), requisicao.fim()).toMinutes() < requisicao.duracaoMin()) {
            throw RequisicaoInvalidaException.noCampo("duracaoMin", "A janela é menor que a duração de uma consulta.");
        }
        Unidade unidade = medico.unidadesAtivas().stream()
                .filter(u -> u.getId().equals(requisicao.unidadeId()))
                .findFirst()
                .orElseThrow(() -> new RegraDeNegocioException(
                        "Você não atende nesta unidade, ou ela não está em funcionamento."));
        DayOfWeek dia = DayOfWeek.of(requisicao.diaSemana());
        boolean sobrepoe = disponibilidades.findByMedicoIdOrderByDiaSemanaAscInicioAsc(medico.getId()).stream()
                .filter(d -> !d.getId().equals(ignorar))
                .anyMatch(d -> d.sobrepoe(dia, requisicao.inicio(), requisicao.fim()));
        if (sobrepoe) {
            throw new ConflitoException("Esse horário se sobrepõe a outra janela de atendimento no mesmo dia.");
        }
        return unidade;
    }

    private Disponibilidade disponibilidadeDoMedico(Medico medico, UUID id) {
        return disponibilidades.findByIdAndMedicoId(id, medico.getId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Disponibilidade", id.toString()));
    }

    // ---------------------------------------------------------------- bloqueios

    @Transactional(readOnly = true)
    public List<BloqueioResposta> bloqueiosFuturos(UsuarioAutenticado usuario) {
        Medico medico = medicoLogado.de(usuario);
        return bloqueios.findByMedicoIdAndFimAfterOrderByInicio(medico.getId(), relogio.instant()).stream()
                .map(b -> BloqueioResposta.de(b, relogio.getZone(), 0))
                .toList();
    }

    /**
     * Cria o bloqueio. Consultas pendentes ou confirmadas no período impedem
     * o bloqueio (422), a menos que `cancelarAgendamentos` seja verdadeiro:
     * aí elas são canceladas e cada paciente é avisado. Paciente já na sala
     * ou em atendimento sempre impede.
     */
    @Transactional
    public BloqueioResposta bloquear(UsuarioAutenticado usuario, CriarBloqueio requisicao, boolean cancelarAgendamentos) {
        Medico medico = medicoLogado.de(usuario);
        ZoneId fuso = relogio.getZone();
        if (!requisicao.inicio().isBefore(requisicao.fim())) {
            throw RequisicaoInvalidaException.noCampo("fim", "O fim precisa ser depois do início.");
        }
        if (!requisicao.fim().isAfter(LocalDateTime.now(relogio))) {
            throw RequisicaoInvalidaException.noCampo("fim", "O bloqueio precisa terminar no futuro.");
        }

        List<Agendamento> afetados = agendamentos.findByMedicoIdAndDataBetweenAndStatusInOrderByDataAscHorarioAsc(
                        medico.getId(), requisicao.inicio().toLocalDate(), requisicao.fim().toLocalDate(),
                        StatusAgendamento.queOcupamHorario()).stream()
                .filter(a -> a.inicio().isBefore(requisicao.fim()) && requisicao.inicio().isBefore(a.fim()))
                .filter(a -> !a.getStatus().concluido())
                .toList();
        if (afetados.stream().anyMatch(a -> a.getStatus() == StatusAgendamento.AGUARDANDO
                || a.getStatus() == StatusAgendamento.EM_ANDAMENTO)) {
            throw new RegraDeNegocioException("Há paciente aguardando ou em atendimento nesse período.");
        }
        if (!afetados.isEmpty() && !cancelarAgendamentos) {
            throw new RegraDeNegocioException(
                    "Há %d consulta(s) marcada(s) nesse período. Confirme o cancelamento para bloquear."
                            .formatted(afetados.size()));
        }

        String motivo = requisicao.motivo() == null || requisicao.motivo().isBlank()
                ? "Agenda do profissional bloqueada."
                : "Agenda do profissional bloqueada: " + requisicao.motivo().strip();
        for (Agendamento agendamento : afetados) {
            agendamento.cancelar(usuarios.getReferenceById(usuario.id()), motivo);
            eventos.publishEvent(new AgendamentoCancelado(agendamento.getId()));
        }
        Instant inicio = requisicao.inicio().atZone(fuso).toInstant();
        Instant fim = requisicao.fim().atZone(fuso).toInstant();
        BloqueioAgenda bloqueio = bloqueios.save(new BloqueioAgenda(medico, inicio, fim, requisicao.motivo()));
        return BloqueioResposta.de(bloqueio, fuso, afetados.size());
    }

    @Transactional
    public void desbloquear(UsuarioAutenticado usuario, UUID id) {
        Medico medico = medicoLogado.de(usuario);
        BloqueioAgenda bloqueio = bloqueios.findByIdAndMedicoId(id, medico.getId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Bloqueio", id.toString()));
        bloqueios.delete(bloqueio);
    }
}
