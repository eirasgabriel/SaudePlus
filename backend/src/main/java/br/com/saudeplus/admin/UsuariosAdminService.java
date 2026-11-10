package br.com.saudeplus.admin;

import java.time.Clock;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.admin.dto.RequisicoesAdmin.AlterarUsuario;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.CriarUsuario;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.DadosDeMedico;
import br.com.saudeplus.admin.dto.UsuarioAdminResposta;
import br.com.saudeplus.admin.dto.UsuarioAdminResposta.Metricas;
import br.com.saudeplus.admin.dto.UsuarioAdminResposta.PerfilMedico;
import br.com.saudeplus.admin.dto.UsuarioAdminResposta.PerfilPaciente;
import br.com.saudeplus.admin.dto.UsuarioAdminResposta.Referencia;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.auth.RecuperacaoDeSenhaService;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.comum.Cpf;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exception.AcessoProibidoException;
import br.com.saudeplus.exception.ConflitoException;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.EspecialidadeRepository;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.StatusConta;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;
import jakarta.persistence.criteria.Predicate;

/**
 * Contas do sistema pela administração. É o único caminho para criar médico,
 * equipe e administrador (o cadastro público só cria paciente).
 *
 * Regras contra escalada de privilégio:
 * - só um ADMIN cria, altera ou bloqueia uma conta ADMIN, ou dá esse papel;
 * - ninguém muda o próprio status ou o próprio papel;
 * - papel só troca entre papéis de equipe; médico e paciente têm perfis
 *   próprios e não viram outra coisa.
 */
@Service
public class UsuariosAdminService {

    static final int TAMANHO_MAXIMO = 500;

    /** Papéis sem perfil próprio: podem trocar entre si. */
    private static final Set<Papel> EQUIPE =
            EnumSet.of(Papel.ADMIN, Papel.GESTOR, Papel.ENFERMEIRO, Papel.RECEPCIONISTA, Papel.AGENTE);

    private final UsuarioRepository usuarios;
    private final MedicoRepository medicos;
    private final PacienteRepository pacientes;
    private final EspecialidadeRepository especialidades;
    private final UnidadeRepository unidades;
    private final PasswordEncoder codificador;
    private final RecuperacaoDeSenhaService convites;
    private final Auditoria auditoria;
    private final Clock relogio;

    public UsuariosAdminService(UsuarioRepository usuarios, MedicoRepository medicos, PacienteRepository pacientes,
            EspecialidadeRepository especialidades, UnidadeRepository unidades, PasswordEncoder codificador,
            RecuperacaoDeSenhaService convites, Auditoria auditoria, Clock relogio) {
        this.usuarios = usuarios;
        this.medicos = medicos;
        this.pacientes = pacientes;
        this.especialidades = especialidades;
        this.unidades = unidades;
        this.codificador = codificador;
        this.convites = convites;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    // ---------------------------------------------------------------- leitura

    @Transactional(readOnly = true)
    public Pagina<UsuarioAdminResposta> listar(String termo, Papel papel, StatusConta status, int pagina, int tamanho) {
        Page<Usuario> encontrados = usuarios.findAll(filtro(termo, papel, status),
                PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO),
                        Sort.by("nomeCompleto").and(Sort.by("id"))));
        List<UUID> ids = encontrados.getContent().stream().map(Usuario::getId).toList();
        Map<UUID, Medico> perfisMedicos = ids.isEmpty() ? Map.of()
                : medicos.findByUsuarioIdIn(ids).stream().collect(Collectors.toMap(m -> m.getUsuario().getId(), Function.identity()));
        Map<UUID, Paciente> perfisPacientes = ids.isEmpty() ? Map.of()
                : pacientes.findByUsuarioIdIn(ids).stream().collect(Collectors.toMap(p -> p.getUsuario().getId(), Function.identity()));
        return Pagina.de(encontrados, u -> resposta(u, perfisMedicos.get(u.getId()), perfisPacientes.get(u.getId())));
    }

    @Transactional(readOnly = true)
    public UsuarioAdminResposta detalhe(UUID id) {
        return resposta(buscar(id));
    }

    @Transactional(readOnly = true)
    public Metricas metricas() {
        YearMonth mes = Periodos.mesAtual(relogio);
        return new Metricas(
                usuarios.count(),
                usuarios.countByStatus(StatusConta.ATIVO),
                usuarios.countByStatus(StatusConta.BLOQUEADO),
                usuarios.countByStatus(StatusConta.INATIVO),
                usuarios.countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(Periodos.inicio(mes, relogio), Periodos.fim(mes, relogio)),
                usuarios.countByCriadoEmGreaterThanEqualAndCriadoEmLessThan(
                        Periodos.inicio(mes.minusMonths(1), relogio), Periodos.fim(mes.minusMonths(1), relogio)));
    }

    // ------------------------------------------------------------------ ações

    @Transactional
    public UsuarioAdminResposta criar(UsuarioAutenticado ator, CriarUsuario requisicao) {
        exigirPodeGerir(ator, requisicao.papel());
        String email = Usuario.normalizarEmail(requisicao.email());
        if (usuarios.existsByEmail(email)) {
            throw new ConflitoException("Já existe uma conta com este e-mail.");
        }
        String cpf = cpf(requisicao.cpf());
        if (cpf != null && usuarios.existsByCpf(cpf)) {
            throw new ConflitoException("Já existe uma conta com este CPF.");
        }
        if (requisicao.papel() == Papel.MEDICO && requisicao.medico() == null) {
            throw RequisicaoInvalidaException.noCampo("medico", "Informe CRM e especialidades do médico.");
        }

        // Senha aleatória e inutilizável: quem entra define a própria pelo convite.
        Usuario usuario = new Usuario(requisicao.nomeCompleto(), email, codificador.encode(UUID.randomUUID().toString()),
                requisicao.telefone(), requisicao.papel());
        usuario.alterarCadastro(requisicao.nomeCompleto(), requisicao.telefone(), cpf);
        gravar(usuario);

        Medico medico = null;
        Paciente paciente = null;
        if (requisicao.papel() == Papel.MEDICO) {
            medico = new Medico(usuario, requisicao.medico().crm(), requisicao.medico().crmUf());
            aplicar(medico, requisicao.medico());
            gravarMedico(medico);
        } else if (requisicao.papel() == Papel.PACIENTE) {
            paciente = new Paciente(usuario);
            if (requisicao.paciente() != null) {
                paciente.informarNascimento(requisicao.paciente().dataNascimento());
            }
            pacientes.save(paciente);
        }
        auditoria.registrar("usuario.criar", "usuario", usuario.getId(),
                Map.of("papel", usuario.getPapel().name(), "email", email));
        convites.convidar(usuario);
        return resposta(usuario, medico, paciente);
    }

    @Transactional
    public UsuarioAdminResposta alterar(UsuarioAutenticado ator, UUID id, AlterarUsuario requisicao) {
        Usuario usuario = buscar(id);
        exigirPodeGerir(ator, usuario.getPapel());
        exigirPodeGerir(ator, requisicao.papel());
        if (requisicao.papel() != usuario.getPapel()) {
            if (usuario.getId().equals(ator.id())) {
                throw new RegraDeNegocioException("Você não pode mudar o seu próprio perfil de acesso.");
            }
            if (!EQUIPE.contains(usuario.getPapel()) || !EQUIPE.contains(requisicao.papel())) {
                throw new RegraDeNegocioException(
                        "Médico e paciente têm cadastro próprio e não mudam de perfil. Crie uma conta nova.");
            }
        }
        String cpf = cpf(requisicao.cpf());
        if (cpf != null && usuarios.existsByCpfAndIdNot(cpf, id)) {
            throw new ConflitoException("Já existe uma conta com este CPF.");
        }
        usuario.alterarCadastro(requisicao.nomeCompleto(), requisicao.telefone(), cpf);
        usuario.alterarPapel(requisicao.papel());
        if (usuario.getPapel() == Papel.MEDICO && requisicao.medico() != null) {
            Medico medico = medicos.findByUsuarioId(id)
                    .orElseGet(() -> new Medico(usuario, requisicao.medico().crm(), requisicao.medico().crmUf()));
            aplicar(medico, requisicao.medico());
            gravarMedico(medico);
        }
        if (requisicao.novaSenha() != null) {
            convites.redefinirPelaAdministracao(usuario, requisicao.novaSenha());
            auditoria.registrar("usuario.redefinirSenha", "usuario", id, Map.of());
        }
        auditoria.registrar("usuario.alterar", "usuario", id, Map.of("papel", usuario.getPapel().name()));
        return resposta(usuario);
    }

    @Transactional
    public UsuarioAdminResposta alterarStatus(UsuarioAutenticado ator, UUID id, StatusConta status) {
        Usuario usuario = buscar(id);
        exigirPodeGerir(ator, usuario.getPapel());
        if (usuario.getId().equals(ator.id())) {
            throw new RegraDeNegocioException("Você não pode alterar o status da sua própria conta.");
        }
        usuario.alterarStatus(status);
        auditoria.registrar("usuario.status", "usuario", id, Map.of("status", status.chave()));
        return resposta(usuario);
    }

    /** Novo link para a pessoa definir a senha (convite expirado ou perdido). */
    @Transactional
    public void reenviarConvite(UsuarioAutenticado ator, UUID id) {
        Usuario usuario = buscar(id);
        exigirPodeGerir(ator, usuario.getPapel());
        convites.convidar(usuario);
        auditoria.registrar("usuario.convite", "usuario", id, Map.of());
    }

    // ------------------------------------------------------------------ apoio

    private void exigirPodeGerir(UsuarioAutenticado ator, Papel papelDoAlvo) {
        if (papelDoAlvo == Papel.ADMIN && ator.papel() != Papel.ADMIN) {
            throw new AcessoProibidoException("Só um administrador pode gerenciar contas de administrador.");
        }
    }

    private void aplicar(Medico medico, DadosDeMedico dados) {
        medico.alterarPerfil(dados.crm(), dados.crmUf(), dados.bio(), dados.valorConsulta());
        List<Especialidade> escolhidas = especialidades.findAllById(dados.especialidadeIds());
        if (escolhidas.size() != new HashSet<>(dados.especialidadeIds()).size()) {
            throw new RegraDeNegocioException("Há especialidade inexistente na lista.");
        }
        List<UUID> idsDasUnidades = dados.unidadeIds() == null ? List.of() : dados.unidadeIds();
        List<Unidade> vinculadas = unidades.findAllById(idsDasUnidades);
        if (vinculadas.size() != new HashSet<>(idsDasUnidades).size()) {
            throw new RegraDeNegocioException("Há unidade inexistente na lista.");
        }
        medico.definirEspecialidades(escolhidas);
        medico.definirUnidades(vinculadas);
    }

    private static String cpf(String informado) {
        try {
            return Cpf.normalizar(informado);
        } catch (IllegalArgumentException excecao) {
            throw RequisicaoInvalidaException.noCampo("cpf", "CPF inválido.");
        }
    }

    /** O índice único do banco decide empates de e-mail/CPF entre requisições simultâneas. */
    private void gravar(Usuario usuario) {
        try {
            usuarios.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException excecao) {
            throw new ConflitoException("Já existe uma conta com este e-mail ou CPF.");
        }
    }

    private void gravarMedico(Medico medico) {
        try {
            medicos.saveAndFlush(medico);
        } catch (DataIntegrityViolationException excecao) {
            throw new ConflitoException("Já existe um médico com este CRM nesta UF.");
        }
    }

    private Usuario buscar(UUID id) {
        return usuarios.findById(id).orElseThrow(() -> RecursoNaoEncontradoException.de("Usuário", id.toString()));
    }

    private static Specification<Usuario> filtro(String termo, Papel papel, StatusConta status) {
        return (usuario, consulta, cb) -> {
            List<Predicate> regras = new ArrayList<>();
            if (termo != null && !termo.isBlank()) {
                String padrao = "%" + termo.strip().toLowerCase(Locale.ROOT).replace("%", "").replace("_", "") + "%";
                regras.add(cb.or(
                        cb.like(cb.lower(usuario.get("nomeCompleto")), padrao),
                        cb.like(cb.lower(usuario.get("email")), padrao),
                        cb.like(usuario.get("cpf"), padrao)));
            }
            if (papel != null) {
                regras.add(cb.equal(usuario.get("papel"), papel));
            }
            if (status != null) {
                regras.add(cb.equal(usuario.get("status"), status));
            }
            return cb.and(regras.toArray(Predicate[]::new));
        };
    }

    private UsuarioAdminResposta resposta(Usuario usuario) {
        return resposta(usuario, medicos.findByUsuarioId(usuario.getId()).orElse(null),
                pacientes.findByUsuarioId(usuario.getId()).orElse(null));
    }

    private static UsuarioAdminResposta resposta(Usuario usuario, Medico medico, Paciente paciente) {
        return new UsuarioAdminResposta(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getCpf(),
                usuario.getPapel(),
                usuario.getStatus(),
                usuario.getFotoUrl(),
                usuario.getUltimoAcesso(),
                usuario.getCriadoEm(),
                medico == null ? null : new PerfilMedico(
                        medico.getId(), medico.getCrm(), medico.getCrmUf(),
                        medico.especialidadesOrdenadas().stream().map(e -> new Referencia(e.getId(), e.getNome())).toList(),
                        medico.unidadesVinculadas().stream()
                                .sorted(Comparator.comparing(Unidade::getNome))
                                .map(u -> new Referencia(u.getId(), u.getNome())).toList(),
                        medico.getValorConsulta(), medico.getBio()),
                paciente == null ? null : new PerfilPaciente(paciente.getId(), paciente.getDataNascimento()));
    }
}
