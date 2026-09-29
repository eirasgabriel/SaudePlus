package br.com.saudeplus;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.context.ApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.saudeplus.agenda.Disponibilidade;
import br.com.saudeplus.agenda.DisponibilidadeRepository;
import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agendamentos.Agendamento;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.agendamentos.TipoAtendimento;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.profissionais.EspecialidadeRepository;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.security.JwtService;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Monta dados de teste direto pelos repositórios. Cada chamada cria contas
 * novas (e-mail e CRM aleatórios), porque o banco é compartilhado entre as
 * classes de teste.
 */
public class Cenarios {

    /** Unidade do SQL de demonstração: Clínica da Família – Centro (Saquarema). */
    public static final UUID UNIDADE_CENTRO = UUID.fromString("a1000000-0000-4000-8000-000000000001");
    /** Unidade do SQL de demonstração em São Paulo, onde os médicos de teste não atendem. */
    public static final UUID UNIDADE_PAULISTA = UUID.fromString("a1000000-0000-4000-8000-000000000003");

    private final UsuarioRepository usuarios;
    private final MedicoRepository medicos;
    private final PacienteRepository pacientes;
    private final EspecialidadeRepository especialidades;
    private final UnidadeRepository unidades;
    private final AgendamentoRepository agendamentos;
    private final DisponibilidadeRepository disponibilidades;
    private final JwtService jwt;
    private final PasswordEncoder codificador;

    public Cenarios(ApplicationContext contexto) {
        this.usuarios = contexto.getBean(UsuarioRepository.class);
        this.medicos = contexto.getBean(MedicoRepository.class);
        this.pacientes = contexto.getBean(PacienteRepository.class);
        this.especialidades = contexto.getBean(EspecialidadeRepository.class);
        this.unidades = contexto.getBean(UnidadeRepository.class);
        this.agendamentos = contexto.getBean(AgendamentoRepository.class);
        this.disponibilidades = contexto.getBean(DisponibilidadeRepository.class);
        this.jwt = contexto.getBean(JwtService.class);
        this.codificador = contexto.getBean(PasswordEncoder.class);
    }

    /** Janela semanal presencial na Clínica da Família – Centro. */
    public void janela(Medico medico, DayOfWeek dia, String inicio, String fim, int duracaoMin) {
        disponibilidades.save(new Disponibilidade(medico, unidades.findById(UNIDADE_CENTRO).orElseThrow(), dia,
                LocalTime.parse(inicio), LocalTime.parse(fim), duracaoMin, Modalidade.PRESENCIAL));
    }

    public Usuario usuario(String nome, Papel papel) {
        String email = "%s-%s@teste.saudeplus.com".formatted(papel.name().toLowerCase(), UUID.randomUUID());
        return usuarios.save(new Usuario(nome, email, codificador.encode("senhaDeTeste1"), null, papel));
    }

    /** Médico clínico geral que atende na Clínica da Família – Centro. */
    public Medico medico() {
        Usuario usuario = usuario("Dr. Teste " + UUID.randomUUID().toString().substring(0, 8), Papel.MEDICO);
        // CRM é único no banco, que todos os testes dividem: 12 dígitos tirados de
        // um UUID não se repetem na prática (seis dígitos sorteados colidiam).
        String crm = "%012d".formatted(Math.floorMod(UUID.randomUUID().getLeastSignificantBits(), 1_000_000_000_000L));
        Medico medico = new Medico(usuario, crm, "RJ");
        medico.adicionarEspecialidade(especialidades.findBySlug("clinico-geral").orElseThrow());
        medico.adicionarUnidade(unidades.findById(UNIDADE_CENTRO).orElseThrow());
        return medicos.save(medico);
    }

    public Paciente paciente(String nome, LocalDate nascimento) {
        Paciente paciente = new Paciente(usuario(nome, Papel.PACIENTE));
        paciente.informarNascimento(nascimento);
        return pacientes.save(paciente);
    }

    /** Agendamento de 30 min, presencial, levado pelas transições reais até `status`. */
    public Agendamento agendamento(Medico medico, Paciente paciente, LocalDate data, String horario,
            StatusAgendamento status) {
        Unidade unidade = unidades.findById(UNIDADE_CENTRO).orElseThrow();
        Agendamento agendamento = new Agendamento(paciente, medico, unidade,
                especialidades.findBySlug("clinico-geral").orElseThrow(), data, LocalTime.parse(horario), 30,
                TipoAtendimento.CONSULTA, Modalidade.PRESENCIAL, "Consulta de teste");
        if (status == StatusAgendamento.CANCELADA) {
            agendamento.mudarStatus(StatusAgendamento.CANCELADA);
        } else {
            for (StatusAgendamento passo : List.of(StatusAgendamento.CONFIRMADA, StatusAgendamento.AGUARDANDO,
                    StatusAgendamento.EM_ANDAMENTO, StatusAgendamento.REALIZADA)) {
                if (agendamento.getStatus() == status) {
                    break;
                }
                agendamento.mudarStatus(passo);
            }
        }
        return agendamentos.save(agendamento);
    }

    public String bearer(Usuario usuario) {
        return "Bearer " + jwt.emitir(usuario).token();
    }

    public String bearer(Medico medico) {
        return bearer(medico.getUsuario());
    }
}
