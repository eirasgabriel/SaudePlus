package br.com.saudeplus.demo;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agenda.Disponibilidade;
import br.com.saudeplus.agenda.DisponibilidadeRepository;
import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exames.StatusExame;
import br.com.saudeplus.exames.TipoExameRepository;
import br.com.saudeplus.financeiro.FormaPagamento;
import br.com.saudeplus.financeiro.Transacao;
import br.com.saudeplus.financeiro.TransacaoRepository;
import br.com.saudeplus.notificacoes.NotificacaoRepository;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.TipoNotificacao;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Só no perfil dev: garante que o médico inicial tenha um dia de trabalho
 * para mostrar no painel — hoje, com consultas em vários status, alguns dias
 * seguintes, exames pendentes e notificações.
 *
 * Roda a cada subida, mas só cria o que falta (agenda de hoje, se hoje ainda
 * não tem nada; exames e notificações, se o médico não tem nenhum). Fica em
 * Java, e não no SQL de demonstração, porque depende do dia de hoje e do
 * médico inicial, que só existe depois das contas iniciais.
 */
@Component
@Profile("dev")
@Order(2)
class AgendaDeDemonstracao implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AgendaDeDemonstracao.class);

    /** Pacientes do SQL de demonstração (`db/demo`), na ordem da agenda. */
    private static final List<UUID> PACIENTES = List.of(
            UUID.fromString("f1000000-0000-4000-8000-000000000001"),
            UUID.fromString("f1000000-0000-4000-8000-000000000002"),
            UUID.fromString("f1000000-0000-4000-8000-000000000003"),
            UUID.fromString("f1000000-0000-4000-8000-000000000004"),
            UUID.fromString("f1000000-0000-4000-8000-000000000005"),
            UUID.fromString("f1000000-0000-4000-8000-000000000006"),
            UUID.fromString("f1000000-0000-4000-8000-000000000007"),
            UUID.fromString("f1000000-0000-4000-8000-000000000008"));

    private final String emailDoMedico;
    private final UsuarioRepository usuarios;
    private final MedicoRepository medicos;
    private final PacienteRepository pacientes;
    private final DisponibilidadeRepository disponibilidades;
    private final AgendamentoRepository agendamentos;
    private final ExameRepository exames;
    private final TipoExameRepository tiposDeExame;
    private final NotificacaoRepository notificacoes;
    private final NotificacaoService notificador;
    private final TransacaoRepository transacoes;

    /** Valor usado quando o médico inicial não tem valor de consulta cadastrado. */
    private static final BigDecimal VALOR_DEMO = new BigDecimal("150.00");
    private final Clock relogio;

    AgendaDeDemonstracao(@Value("${saudeplus.contas-iniciais.medico.email:}") String emailDoMedico,
            UsuarioRepository usuarios, MedicoRepository medicos, PacienteRepository pacientes, DisponibilidadeRepository disponibilidades,
            AgendamentoRepository agendamentos, ExameRepository exames, TipoExameRepository tiposDeExame,
            NotificacaoRepository notificacoes, NotificacaoService notificador, TransacaoRepository transacoes,
            Clock relogio) {
        this.emailDoMedico = Usuario.normalizarEmail(emailDoMedico);
        this.usuarios = usuarios;
        this.medicos = medicos;
        this.pacientes = pacientes;
        this.disponibilidades = disponibilidades;
        this.agendamentos = agendamentos;
        this.exames = exames;
        this.tiposDeExame = tiposDeExame;
        this.notificacoes = notificacoes;
        this.notificador = notificador;
        this.transacoes = transacoes;
        this.relogio = relogio;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments argumentos) {
        Medico medico = usuarios.findByEmail(emailDoMedico)
                .flatMap(usuario -> medicos.findByUsuarioId(usuario.getId()))
                .orElse(null);
        Map<UUID, Paciente> porId = pacientes.findAllById(PACIENTES).stream()
                .collect(Collectors.toMap(Paciente::getId, Function.identity()));
        if (medico == null || medico.unidadesAtivas().isEmpty() || medico.especialidadesOrdenadas().isEmpty()
                || porId.size() < PACIENTES.size()) {
            log.info("Agenda de demonstração não criada: médico inicial sem perfil completo ou sem pacientes demo.");
            return;
        }
        List<Paciente> lista = PACIENTES.stream().map(porId::get).toList();
        Unidade unidade = medico.unidadesAtivas().getFirst();
        Especialidade especialidade = medico.especialidadesOrdenadas().getFirst();

        garantirDisponibilidades(medico, unidade);
        LocalDate hoje = LocalDate.now(relogio);
        if (agendamentos.findByMedicoIdAndDataOrderByHorario(medico.getId(), hoje).isEmpty()) {
            criarDia(medico, unidade, especialidade, lista, hoje);
            log.info("Agenda de demonstração de {} criada para {}.", medico.getUsuario().getNomeCompleto(), hoje);
        }
        if (exames.pendentesDoMedico(medico.getId(), StatusExame.pendentes()).isEmpty()) {
            criarExames(medico, lista, hoje);
        }
        if (!notificacoes.existsByUsuarioId(medico.getUsuario().getId())) {
            criarNotificacoes(medico.getUsuario());
        }
        garantirCobrancas(medico, hoje);
    }

    /**
     * A agenda de demonstração é criada já no status final, sem passar pela
     * confirmação que gera cobrança. Aqui cada consulta confirmada ou adiante
     * ganha a sua: paga se realizada, pendente nas demais.
     */
    private void garantirCobrancas(Medico medico, LocalDate hoje) {
        BigDecimal valor = medico.getValorConsulta() != null ? medico.getValorConsulta() : VALOR_DEMO;
        List<FormaPagamento> formas = List.of(FormaPagamento.PIX, FormaPagamento.CREDITO, FormaPagamento.DEBITO);
        int i = 0;
        for (Agendamento agendamento : agendamentos.findByMedicoIdAndDataBetweenAndStatusInOrderByDataAscHorarioAsc(
                medico.getId(), hoje.minusDays(7), hoje.plusDays(7), EnumSet.of(StatusAgendamento.CONFIRMADA,
                        StatusAgendamento.AGUARDANDO, StatusAgendamento.EM_ANDAMENTO, StatusAgendamento.REALIZADA))) {
            if (!transacoes.findByAgendamentoId(agendamento.getId()).isEmpty()) {
                continue;
            }
            Transacao cobranca = Transacao.daConsulta(agendamento.getPaciente(), agendamento.getId(),
                    "Consulta – " + agendamento.getEspecialidade().getNome() + " – " + medico.getUsuario().getNomeCompleto(),
                    valor, null, relogio.instant());
            if (agendamento.getStatus() == StatusAgendamento.REALIZADA) {
                cobranca.pagar(formas.get(i++ % formas.size()), relogio.instant());
            }
            transacoes.save(cobranca);
        }
    }

    private void garantirDisponibilidades(Medico medico, Unidade unidade) {
        if (!disponibilidades.findByMedicoIdOrderByDiaSemanaAscInicioAsc(medico.getId()).isEmpty()) {
            return;
        }
        for (DayOfWeek dia : List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY)) {
            disponibilidades.save(new Disponibilidade(medico, unidade, dia, LocalTime.of(8, 0), LocalTime.of(12, 0), 40,
                    Modalidade.PRESENCIAL));
            disponibilidades.save(new Disponibilidade(medico, unidade, dia, LocalTime.of(14, 0), LocalTime.of(17, 20), 40,
                    Modalidade.PRESENCIAL));
        }
    }

    /** Hoje com a agenda do antigo painel em memória; ontem com histórico; próximos dias com reservas. */
    private void criarDia(Medico medico, Unidade unidade, Especialidade especialidade, List<Paciente> p, LocalDate hoje) {
        consulta(medico, unidade, especialidade, p.get(0), hoje, "08:00", "Consulta de rotina", StatusAgendamento.REALIZADA);
        consulta(medico, unidade, especialidade, p.get(1), hoje, "08:40", "Consulta pediátrica", StatusAgendamento.REALIZADA);
        consulta(medico, unidade, especialidade, p.get(2), hoje, "09:20", "Retorno - Exames", StatusAgendamento.REALIZADA);
        consulta(medico, unidade, especialidade, p.get(3), hoje, "10:00", "Consulta clínica geral", StatusAgendamento.EM_ANDAMENTO);
        consulta(medico, unidade, especialidade, p.get(4), hoje, "10:40", "Consulta de rotina", StatusAgendamento.AGUARDANDO);
        consulta(medico, unidade, especialidade, p.get(5), hoje, "11:20", "Consulta retorno", StatusAgendamento.AGUARDANDO);
        consulta(medico, unidade, especialidade, p.get(6), hoje, "14:00", "Consulta de rotina", StatusAgendamento.CONFIRMADA);
        consulta(medico, unidade, especialidade, p.get(7), hoje, "14:40", "Consulta clínica geral", StatusAgendamento.CONFIRMADA);

        for (int dias = 1; dias <= 3; dias++) {
            LocalDate dia = hoje.plusDays(dias);
            consulta(medico, unidade, especialidade, p.get(dias), dia, "09:20", "Consulta de rotina",
                    StatusAgendamento.CONFIRMADA);
            consulta(medico, unidade, especialidade, p.get(dias + 3), dia, "15:20", "Consulta retorno",
                    StatusAgendamento.PENDENTE);
        }
    }

    private void consulta(Medico medico, Unidade unidade, Especialidade especialidade, Paciente paciente, LocalDate dia,
            String horario, String motivo, StatusAgendamento alvo) {
        TipoAtendimento tipo = motivo.toLowerCase().contains("retorno") ? TipoAtendimento.RETORNO : TipoAtendimento.CONSULTA;
        LocalTime inicio = LocalTime.parse(horario);
        if (pacienteOcupado(paciente, dia, inicio, 40)) {
            // O paciente de exemplo já marcou algo nesse horário (pela tela):
            // o banco recusaria a sobreposição e derrubaria a subida.
            return;
        }
        Agendamento agendamento = new Agendamento(paciente, medico, unidade, especialidade, dia, inicio,
                40, tipo, Modalidade.PRESENCIAL, motivo);
        // Percorre as transições reais até o status desejado.
        for (StatusAgendamento passo : List.of(StatusAgendamento.CONFIRMADA, StatusAgendamento.AGUARDANDO,
                StatusAgendamento.EM_ANDAMENTO)) {
            if (agendamento.getStatus() == alvo) {
                break;
            }
            agendamento.mudarStatus(passo);
        }
        if (alvo == StatusAgendamento.REALIZADA) {
            agendamento.registrarAtendimento("Atendimento de demonstração sem intercorrências.", "Retorno em 6 meses.");
        }
        agendamentos.save(agendamento);
    }

    private boolean pacienteOcupado(Paciente paciente, LocalDate dia, LocalTime inicio, int duracaoMin) {
        LocalDateTime comeco = LocalDateTime.of(dia, inicio);
        LocalDateTime fim = comeco.plusMinutes(duracaoMin);
        return agendamentos.findByPacienteIdAndDataAndStatusIn(paciente.getId(), dia,
                        StatusAgendamento.queOcupamHorario()).stream()
                .anyMatch(a -> a.inicio().isBefore(fim) && comeco.isBefore(a.fim()));
    }

    private void criarExames(Medico medico, List<Paciente> p, LocalDate hoje) {
        exame(medico, p.get(1), "Hemograma completo", hoje);
        exame(medico, p.get(2), "Ultrassonografia abdominal", hoje.plusDays(1));
        exame(medico, p.get(3), "Raio-X de tórax", hoje.plusDays(27));
    }

    private void exame(Medico medico, Paciente paciente, String nome, LocalDate prazo) {
        tiposDeExame.findByNome(nome).ifPresent(tipo -> exames.save(new Exame(paciente, medico, tipo, prazo)));
    }

    private void criarNotificacoes(Usuario medico) {
        notificador.notificar(medico, TipoNotificacao.RETORNO, "Lembrete de retorno", "João Gabriel Santos – próxima semana");
        notificador.notificar(medico, TipoNotificacao.AGENDAMENTO, "Novo agendamento", "Lucas Martins – 14:40");
        notificador.notificar(medico, TipoNotificacao.RESULTADO, "Resultado de exame disponível",
                "Mariana Costa – Ultrassonografia abdominal");
    }
}
