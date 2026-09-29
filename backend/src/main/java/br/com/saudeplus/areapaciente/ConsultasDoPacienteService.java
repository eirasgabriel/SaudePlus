package br.com.saudeplus.areapaciente;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agenda.RegrasDaAgenda;
import br.com.saudeplus.agenda.AgendaService;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.HorarioLivre;
import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoCancelado;
import br.com.saudeplus.agendamentos.AgendamentoCriado;
import br.com.saudeplus.agendamentos.AgendamentoRemarcado;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.areapaciente.dto.ConsultaDoPacienteResposta;
import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.Avaliar;
import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.Remarcar;
import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.Reservar;
import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente;
import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente.Atendimento;
import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente.AvaliacaoRegistrada;
import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente.Painel;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.comum.Nomes;
import br.com.saudeplus.comum.RestricoesDoBanco;
import br.com.saudeplus.exception.ConflitoException;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.profissionais.Avaliacao;
import br.com.saudeplus.profissionais.AvaliacaoRepository;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.EspecialidadeRepository;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Consultas do paciente: reservar, cancelar, remarcar, acompanhar e avaliar.
 *
 * Regras de reserva: o horário precisa estar entre os livres do médico (a
 * mesma conta que a busca mostra), e o paciente não pode ter outra consulta
 * no mesmo horário. Mesmo que duas pessoas passem pelas duas conferências ao
 * mesmo tempo, o índice único do banco deixa só uma reserva: a outra recebe 409.
 */
@Service
public class ConsultasDoPacienteService {

    /** Quantas próximas consultas o painel mostra. */
    private static final int PROXIMAS_NO_PAINEL = 3;

    private final PacienteLogado pacienteLogado;
    private final AgendamentoRepository agendamentos;
    private final MedicoRepository medicos;
    private final EspecialidadeRepository especialidades;
    private final UnidadeRepository unidades;
    private final UsuarioRepository usuarios;
    private final AvaliacaoRepository avaliacoes;
    private final AgendaService agenda;
    private final RegrasDaAgenda regras;
    private final NotificacaoService notificacoes;
    private final ApplicationEventPublisher eventos;
    private final Clock relogio;

    public ConsultasDoPacienteService(PacienteLogado pacienteLogado, AgendamentoRepository agendamentos,
            MedicoRepository medicos, EspecialidadeRepository especialidades, UnidadeRepository unidades,
            UsuarioRepository usuarios, AvaliacaoRepository avaliacoes, AgendaService agenda, RegrasDaAgenda regras,
            NotificacaoService notificacoes, ApplicationEventPublisher eventos, Clock relogio) {
        this.pacienteLogado = pacienteLogado;
        this.agendamentos = agendamentos;
        this.medicos = medicos;
        this.especialidades = especialidades;
        this.unidades = unidades;
        this.usuarios = usuarios;
        this.avaliacoes = avaliacoes;
        this.agenda = agenda;
        this.regras = regras;
        this.notificacoes = notificacoes;
        this.eventos = eventos;
        this.relogio = relogio;
    }

    // ---------------------------------------------------------------- leitura

    /** Id do perfil de paciente de quem está logado (para as rotas de outros domínios). */
    @Transactional(readOnly = true)
    public UUID pacienteDe(UsuarioAutenticado usuario) {
        return pacienteLogado.de(usuario).getId();
    }

    @Transactional(readOnly = true)
    public Painel painel(UsuarioAutenticado usuario) {
        Paciente paciente = pacienteLogado.de(usuario);
        List<Agendamento> proximas = futuras(paciente).stream()
                .filter(a -> a.getStatus().ocupaHorario())
                .limit(PROXIMAS_NO_PAINEL)
                .toList();
        String nome = paciente.getUsuario().getNomeCompleto();
        return new Painel(
                new RespostasDoPaciente.Paciente(
                        paciente.getId(), nome, paciente.getUsuario().getFotoUrl(), Nomes.iniciais(nome)),
                proximas.stream().map(this::resposta).toList(),
                proximas.isEmpty() ? null : ConsultaDoPacienteResposta.Local.de(proximas.getFirst().getUnidade()),
                notificacoes.naoLidas(usuario.id()));
    }

    /** `situacao`: "futuras", "passadas" ou nula para todas; `status` opcional. */
    @Transactional(readOnly = true)
    public List<ConsultaDoPacienteResposta> listar(UsuarioAutenticado usuario, String situacao, StatusAgendamento status) {
        Paciente paciente = pacienteLogado.de(usuario);
        LocalDateTime agora = LocalDateTime.now(relogio);
        List<Agendamento> todas = agendamentos.findByPacienteIdOrderByDataAscHorarioAsc(paciente.getId());
        List<Agendamento> filtradas = switch (situacao == null ? "" : situacao) {
            case "futuras" -> todas.stream().filter(a -> !a.inicio().isBefore(agora)).toList();
            case "passadas" -> todas.stream().filter(a -> a.inicio().isBefore(agora))
                    .sorted(Comparator.comparing(Agendamento::inicio).reversed()).toList();
            case "" -> todas;
            default -> throw new IllegalArgumentException("Situação desconhecida: " + situacao);
        };
        return filtradas.stream()
                .filter(a -> status == null || a.getStatus() == status)
                .map(this::resposta)
                .toList();
    }

    /** Consultas realizadas, da mais recente para a mais antiga, com a nota que o paciente deu. */
    @Transactional(readOnly = true)
    public List<Atendimento> historico(UsuarioAutenticado usuario) {
        Paciente paciente = pacienteLogado.de(usuario);
        List<Agendamento> realizadas = agendamentos.findByPacienteIdOrderByDataAscHorarioAsc(paciente.getId()).stream()
                .filter(a -> a.getStatus() == StatusAgendamento.REALIZADA)
                .sorted(Comparator.comparing(Agendamento::inicio).reversed())
                .toList();
        Map<UUID, Integer> notas = realizadas.isEmpty() ? Map.of()
                : avaliacoes.findByAgendamentoIdIn(realizadas.stream().map(Agendamento::getId).toList()).stream()
                        .collect(Collectors.toMap(Avaliacao::getAgendamentoId, Avaliacao::getNota));
        return realizadas.stream().map(a -> new Atendimento(
                a.getId(), a.inicio(), a.getEspecialidade().getNome(), a.getMedico().getUsuario().getNomeCompleto(),
                a.getUnidade().getNome(), a.getResumo(), a.getDesfecho(), notas.get(a.getId()))).toList();
    }

    // ------------------------------------------------------------------ ações

    @Transactional
    public ConsultaDoPacienteResposta reservar(UsuarioAutenticado usuario, Reservar requisicao) {
        Paciente paciente = pacienteLogado.de(usuario);
        Medico medico = medicos.findComUsuarioById(requisicao.medicoId())
                .filter(m -> m.getUsuario().ativo())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Profissional", requisicao.medicoId().toString()));
        Especialidade especialidade = especialidades.findById(requisicao.especialidadeId())
                .filter(medico::atendeEm)
                .orElseThrow(() -> new RegraDeNegocioException("Este profissional não atende nessa especialidade."));
        HorarioLivre livre = horarioLivre(medico, requisicao.data(), requisicao.horario(), requisicao.modalidade());
        conferirAgendaDoPaciente(paciente, requisicao.data(), requisicao.horario(), livre.duracaoMin(), null);

        Agendamento agendamento = new Agendamento(paciente, medico, unidades.getReferenceById(livre.unidadeId()),
                especialidade, livre.data(), livre.horario(), livre.duracaoMin(), TipoAtendimento.CONSULTA,
                livre.modalidade(), requisicao.motivo());
        gravar(agendamento);
        eventos.publishEvent(new AgendamentoCriado(agendamento.getId()));
        return resposta(recarregar(agendamento, paciente));
    }

    @Transactional
    public ConsultaDoPacienteResposta cancelar(UsuarioAutenticado usuario, UUID agendamentoId, String motivo) {
        Paciente paciente = pacienteLogado.de(usuario);
        Agendamento agendamento = doPaciente(paciente, agendamentoId);
        exigirAntecedencia(agendamento, "cancelar");
        agendamento.cancelar(usuarios.getReferenceById(usuario.id()),
                motivo == null || motivo.isBlank() ? "Cancelada pelo paciente." : motivo.strip());
        eventos.publishEvent(new AgendamentoCancelado(agendamento.getId()));
        return resposta(agendamento);
    }

    @Transactional
    public ConsultaDoPacienteResposta remarcar(UsuarioAutenticado usuario, UUID agendamentoId, Remarcar requisicao) {
        Paciente paciente = pacienteLogado.de(usuario);
        Agendamento agendamento = doPaciente(paciente, agendamentoId);
        exigirAntecedencia(agendamento, "remarcar");
        LocalDateTime anterior = agendamento.inicio();
        HorarioLivre livre = horarioLivre(agendamento.getMedico(), requisicao.data(), requisicao.horario(),
                requisicao.modalidade());
        conferirAgendaDoPaciente(paciente, requisicao.data(), requisicao.horario(), livre.duracaoMin(), agendamento.getId());

        agendamento.remarcar(livre.data(), livre.horario(), unidades.getReferenceById(livre.unidadeId()),
                livre.modalidade(), livre.duracaoMin());
        gravar(agendamento);
        eventos.publishEvent(new AgendamentoRemarcado(agendamento.getId(), anterior));
        return resposta(recarregar(agendamento, paciente));
    }

    @Transactional
    public AvaliacaoRegistrada avaliar(UsuarioAutenticado usuario, Avaliar requisicao) {
        Paciente paciente = pacienteLogado.de(usuario);
        Agendamento agendamento = doPaciente(paciente, requisicao.agendamentoId());
        if (agendamento.getStatus() != StatusAgendamento.REALIZADA) {
            throw new RegraDeNegocioException("Só é possível avaliar uma consulta já realizada.");
        }
        if (avaliacoes.existsByAgendamentoId(agendamento.getId())) {
            throw new ConflitoException("Você já avaliou esta consulta.");
        }
        Avaliacao avaliacao;
        try {
            avaliacao = avaliacoes.saveAndFlush(new Avaliacao(agendamento.getId(), paciente, agendamento.getMedico(),
                    requisicao.nota(), requisicao.comentario()));
        } catch (DataIntegrityViolationException excecao) {
            // Duas avaliações ao mesmo tempo: o índice único deixa passar só uma.
            throw new ConflitoException("Você já avaliou esta consulta.");
        }
        medicos.registrarAvaliacao(agendamento.getMedico().getId(), requisicao.nota());
        return new AvaliacaoRegistrada(agendamento.getId(), avaliacao.getNota(), avaliacao.getComentario());
    }

    // ------------------------------------------------------------------ apoio

    /** O horário pedido entre os livres do médico; indisponível é conflito (409). */
    private HorarioLivre horarioLivre(Medico medico, LocalDate data, LocalTime horario, Modalidade modalidade) {
        return agenda.horariosLivres(medico.getId(), data, data).stream()
                .filter(livre -> livre.data().equals(data) && livre.horario().equals(horario))
                .filter(livre -> modalidade == null || livre.modalidade() == modalidade)
                .findFirst()
                .orElseThrow(() -> new ConflitoException("Esse horário não está mais disponível. Escolha outro."));
    }

    private void conferirAgendaDoPaciente(Paciente paciente, LocalDate data, LocalTime horario, int duracaoMin,
            UUID ignorar) {
        LocalDateTime inicio = LocalDateTime.of(data, horario);
        LocalDateTime fim = inicio.plusMinutes(duracaoMin);
        boolean choque = agendamentos.findByPacienteIdAndDataAndStatusIn(paciente.getId(), data,
                        StatusAgendamento.queOcupamHorario()).stream()
                .filter(a -> !a.getId().equals(ignorar))
                .anyMatch(a -> a.inicio().isBefore(fim) && inicio.isBefore(a.fim()));
        if (choque) {
            throw new ConflitoException("Você já tem uma consulta nesse horário.");
        }
    }

    private void exigirAntecedencia(Agendamento agendamento, String acao) {
        if (!agendamento.alteravel()) {
            throw new RegraDeNegocioException("Esta consulta não pode mais ser alterada.");
        }
        Duration antecedencia = regras.atuais().antecedenciaCancelamento();
        if (LocalDateTime.now(relogio).plus(antecedencia).isAfter(agendamento.inicio())) {
            throw new RegraDeNegocioException(
                    "Para %s, é preciso pelo menos %d horas de antecedência. Fale com a clínica."
                            .formatted(acao, antecedencia.toHours()));
        }
    }

    /**
     * O banco é a palavra final sobre horário ocupado: recusa duas consultas
     * ativas que se sobreponham, do mesmo médico ou do mesmo paciente (V6).
     */
    private void gravar(Agendamento agendamento) {
        try {
            agendamentos.saveAndFlush(agendamento);
        } catch (DataIntegrityViolationException excecao) {
            if (RestricoesDoBanco.violou(excecao, "ex_agendamentos_paciente_sem_sobreposicao")) {
                throw new ConflitoException("Você já tem uma consulta nesse horário.");
            }
            throw new ConflitoException("Esse horário acabou de ser reservado. Escolha outro.");
        }
    }

    /** Relê com médico, unidade e especialidade carregados, para montar a resposta. */
    private Agendamento recarregar(Agendamento agendamento, Paciente paciente) {
        return agendamentos.findByIdAndPacienteId(agendamento.getId(), paciente.getId()).orElse(agendamento);
    }

    private Agendamento doPaciente(Paciente paciente, UUID agendamentoId) {
        return agendamentos.findByIdAndPacienteId(agendamentoId, paciente.getId())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Consulta", agendamentoId.toString()));
    }

    private List<Agendamento> futuras(Paciente paciente) {
        LocalDateTime agora = LocalDateTime.now(relogio);
        return agendamentos.findByPacienteIdOrderByDataAscHorarioAsc(paciente.getId()).stream()
                .filter(a -> !a.inicio().isBefore(agora))
                .toList();
    }

    private ConsultaDoPacienteResposta resposta(Agendamento agendamento) {
        boolean podeAlterar = agendamento.alteravel() && !LocalDateTime.now(relogio)
                .plus(regras.atuais().antecedenciaCancelamento()).isAfter(agendamento.inicio());
        return ConsultaDoPacienteResposta.de(agendamento, podeAlterar);
    }
}
