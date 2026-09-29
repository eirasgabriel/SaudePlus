package br.com.saudeplus.seed;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.comum.Cpf;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.profissionais.EspecialidadeRepository;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Completa as contas iniciais (admin e médico principal) com o paciente
 * principal, mais dois médicos e mais nove pacientes, para testar as três
 * áreas em qualquer ambiente. Só roda com `SEED_ENABLED=true`.
 *
 * Tudo é fictício: e-mails em `@exemplo.com`, telefones `(11) 90000-xxxx`,
 * CRMs `900.00x` e CPFs com base `900.000.0xx` e dígitos verificadores
 * válidos. Registro cujo e-mail, CPF ou CRM já existe é pulado, nunca
 * sobrescrito; rodar de novo a cada deploy não duplica nada.
 *
 * Não cria consultas: o vínculo paciente–médico só existe por agendamento, e
 * a agenda de demonstração (perfil dev) já cuida disso.
 */
@Component
@ConditionalOnProperty(name = "saudeplus.seed.habilitado", havingValue = "true")
@Order(3)
class DadosDeTeste implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DadosDeTeste.class);

    private static final List<MedicoFicticio> MEDICOS = List.of(
            new MedicoFicticio("Dra. Helena Prates", "medico2@exemplo.com", "(11) 90000-0102", "900.002", "SP",
                    "cardiologia", "Cardiologista (cadastro fictício de teste).", new BigDecimal("240.00")),
            new MedicoFicticio("Dr. Otávio Brandão", "medico3@exemplo.com", "(11) 90000-0103", "900.003", "SP",
                    "pediatria", "Pediatra (cadastro fictício de teste).", new BigDecimal("210.00")));

    /** O primeiro usa o e-mail e a senha de `SEED_PACIENTE_*`; os demais, os e-mails fixos daqui. */
    private static final List<PacienteFicticio> PACIENTES = List.of(
            new PacienteFicticio("Paciente de Teste", null, "(11) 90000-0201", "900000001", "1990-04-12", "feminino"),
            new PacienteFicticio("Bruno Teixeira Nunes", "paciente2@exemplo.com", "(11) 90000-0202", "900000002", "1985-09-03", "masculino"),
            new PacienteFicticio("Clara Mendes Rocha", "paciente3@exemplo.com", "(11) 90000-0203", "900000003", "2019-02-20", "feminino"),
            new PacienteFicticio("Diego Farias Lopes", "paciente4@exemplo.com", "(11) 90000-0204", "900000004", "1958-11-30", "masculino"),
            new PacienteFicticio("Elisa Moura Campos", "paciente5@exemplo.com", "(11) 90000-0205", "900000005", "2001-07-15", "feminino"),
            new PacienteFicticio("Fábio Antunes Prado", "paciente6@exemplo.com", "(11) 90000-0206", "900000006", "1972-01-08", "masculino"),
            new PacienteFicticio("Gabriela Pires Souto", "paciente7@exemplo.com", "(11) 90000-0207", "900000007", "1995-12-24", "feminino"),
            new PacienteFicticio("Heitor Vasconcelos Lima", "paciente8@exemplo.com", "(11) 90000-0208", "900000008", "2012-05-05", "masculino"),
            new PacienteFicticio("Irene Batista Coelho", "paciente9@exemplo.com", "(11) 90000-0209", "900000009", "1946-03-17", "feminino"),
            new PacienteFicticio("João Pedro Quintela", "paciente10@exemplo.com", "(11) 90000-0210", "900000010", "2006-10-01", "masculino"));

    private final UsuarioRepository usuarios;
    private final MedicoRepository medicos;
    private final PacienteRepository pacientes;
    private final EspecialidadeRepository especialidades;
    private final PasswordEncoder codificador;
    private final String emailDoPaciente;
    private final String senhaDoPaciente;
    private final String senhaPadrao;

    DadosDeTeste(UsuarioRepository usuarios, MedicoRepository medicos, PacienteRepository pacientes,
            EspecialidadeRepository especialidades, PasswordEncoder codificador,
            @Value("${saudeplus.contas-iniciais.paciente.email:}") String emailDoPaciente,
            @Value("${saudeplus.contas-iniciais.paciente.senha:}") String senhaDoPaciente,
            @Value("${saudeplus.seed.senha-padrao:}") String senhaPadrao) {
        this.usuarios = usuarios;
        this.medicos = medicos;
        this.pacientes = pacientes;
        this.especialidades = especialidades;
        this.codificador = codificador;
        this.emailDoPaciente = emailDoPaciente;
        this.senhaDoPaciente = senhaDoPaciente;
        this.senhaPadrao = senhaPadrao;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments argumentos) {
        int criados = 0;
        for (MedicoFicticio medico : MEDICOS) {
            criados += criarMedico(medico) ? 1 : 0;
        }
        for (int i = 0; i < PACIENTES.size(); i++) {
            PacienteFicticio paciente = PACIENTES.get(i);
            boolean principal = i == 0;
            String email = principal ? emailDoPaciente : paciente.email();
            if (vazio(email)) {
                log.warn("Paciente principal sem e-mail configurado (SEED_PACIENTE_EMAIL); pulado.");
                continue;
            }
            criados += criarPaciente(paciente, email, principal ? senhaDoPaciente : null, principal) ? 1 : 0;
        }
        log.info("Dados de teste: {} registro(s) criado(s), {} já existiam.",
                criados, MEDICOS.size() + PACIENTES.size() - criados);
    }

    private boolean criarMedico(MedicoFicticio dados) {
        String email = Usuario.normalizarEmail(dados.email());
        if (usuarios.existsByEmail(email)) {
            log.info("Médico {} já existe; pulado.", email);
            return false;
        }
        if (medicos.existsByCrmAndCrmUf(dados.crm(), dados.crmUf())) {
            log.warn("CRM {}/{} já pertence a outro médico; {} pulado.", dados.crm(), dados.crmUf(), email);
            return false;
        }
        Usuario usuario = usuarios.save(new Usuario(dados.nome(), email, codificador.encode(senhaDasContas()),
                dados.telefone(), Papel.MEDICO));
        Medico medico = new Medico(usuario, dados.crm(), dados.crmUf());
        medico.alterarPerfil(dados.crm(), dados.crmUf(), dados.bio(), dados.valorConsulta());
        especialidades.findBySlug(dados.especialidade()).ifPresentOrElse(medico::adicionarEspecialidade,
                () -> log.warn("Especialidade '{}' não existe; {} ficou sem especialidade.", dados.especialidade(), email));
        medicos.save(medico);
        log.info("Médico de teste criado: {} ({})", email, dados.especialidade());
        return true;
    }

    private boolean criarPaciente(PacienteFicticio dados, String emailInformado, String senhaInformada, boolean principal) {
        String email = Usuario.normalizarEmail(emailInformado);
        if (usuarios.existsByEmail(email)) {
            log.info("Paciente {} já existe; pulado.", email);
            return false;
        }
        String cpf = Cpf.comDigitosVerificadores(dados.baseCpf());
        if (usuarios.existsByCpf(cpf)) {
            log.warn("CPF de teste {} já pertence a outra conta; {} pulado.", cpf, email);
            return false;
        }
        String senha = vazio(senhaInformada) ? senhaDasContas() : senhaInformada;
        Usuario usuario = new Usuario(dados.nome(), email, codificador.encode(senha), dados.telefone(), Papel.PACIENTE);
        usuario.alterarCadastro(dados.nome(), dados.telefone(), cpf);
        usuarios.save(usuario);
        Paciente paciente = new Paciente(usuario);
        paciente.informarNascimento(LocalDate.parse(dados.nascimento()));
        paciente.informarSexo(dados.sexo());
        pacientes.save(paciente);
        if (principal && vazio(senhaInformada) && !vazio(senhaPadrao)) {
            log.warn("Paciente de teste criado: {} com a senha padrão de teste. Defina SEED_PACIENTE_SENHA ou troque a senha.",
                    email);
        } else {
            log.info("Paciente de teste criado: {}", email);
        }
        return true;
    }

    /**
     * Senha padrão de teste. Se ela foi deixada em branco de propósito, cada
     * conta ganha uma senha aleatória que não vai para o log: o acesso passa a
     * ser só por "esqueci minha senha".
     */
    private String senhaDasContas() {
        return vazio(senhaPadrao) ? UUID.randomUUID().toString() : senhaPadrao;
    }

    private static boolean vazio(String valor) {
        return valor == null || valor.isBlank();
    }

    private record MedicoFicticio(String nome, String email, String telefone, String crm, String crmUf,
            String especialidade, String bio, BigDecimal valorConsulta) {
    }

    private record PacienteFicticio(String nome, String email, String telefone, String baseCpf, String nascimento,
            String sexo) {
    }
}
