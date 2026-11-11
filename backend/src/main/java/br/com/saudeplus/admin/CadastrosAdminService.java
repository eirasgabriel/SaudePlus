package br.com.saudeplus.admin;

import java.text.Normalizer;
import java.time.Clock;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;
import br.com.saudeplus.usuarios.Papel;

import br.com.saudeplus.admin.dto.CadastrosAdminResposta.ConvenioAdmin;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.EspecialidadeAdmin;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.MetricasDeUnidades;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.TipoExameAdmin;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.UnidadeAdmin;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarConvenio;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarEspecialidade;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarTipoExame;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarUnidade;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.clinicas.StatusUnidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.comum.Cnpj;
import br.com.saudeplus.exames.TipoExame;
import br.com.saudeplus.exames.TipoExameRepository;
import br.com.saudeplus.exception.ConflitoException;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.profissionais.Convenio;
import br.com.saudeplus.profissionais.ConvenioRepository;
import br.com.saudeplus.profissionais.Especialidade;
import br.com.saudeplus.profissionais.EspecialidadeRepository;
import br.com.saudeplus.profissionais.MedicoRepository;

/**
 * Cadastros da administração: unidades de atendimento e os catálogos
 * (especialidades, convênios, tipos de exame). Nada é apagado: unidade sai de
 * operação pelo status e convênio pelo `ativo`, porque há agendamentos e
 * exames que apontam para eles.
 */
@Service
public class CadastrosAdminService {

    private final UnidadeRepository unidades;
    private final MedicoRepository medicos;
    private final AgendamentoRepository agendamentos;
    private final EspecialidadeRepository especialidades;
    private final ConvenioRepository convenios;
    private final TipoExameRepository tiposDeExame;
    private final Auditoria auditoria;
    private final Clock relogio;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder codificador;

    public CadastrosAdminService(UnidadeRepository unidades, MedicoRepository medicos, AgendamentoRepository agendamentos,
            EspecialidadeRepository especialidades, ConvenioRepository convenios, TipoExameRepository tiposDeExame,
            Auditoria auditoria, Clock relogio, UsuarioRepository usuarios, PasswordEncoder codificador) {
        this.unidades = unidades;
        this.medicos = medicos;
        this.agendamentos = agendamentos;
        this.especialidades = especialidades;
        this.convenios = convenios;
        this.tiposDeExame = tiposDeExame;
        this.auditoria = auditoria;
        this.relogio = relogio;
        this.usuarios = usuarios;
        this.codificador = codificador;
    }

    // ------------------------------------------------------------------ unidades

    /** Todas as unidades (inclusive fora de operação), com especialidades, médicos e movimento do mês. */
    @Transactional(readOnly = true)
    public List<UnidadeAdmin> unidades() {
        Map<UUID, String> emailsLogin = usuarios.findAllByPapel(Papel.CLINICA).stream()
                .collect(Collectors.toMap(u -> u.getUnidade().getId(), Usuario::getEmail));
        Map<UUID, List<String>> especialidadesPorUnidade = medicos.especialidadesPorUnidade().stream()
                .collect(Collectors.groupingBy(linha -> (UUID) linha[0], Collectors.collectingAndThen(
                        Collectors.mapping(linha -> (String) linha[1], Collectors.toCollection(TreeSet::new)),
                        List::copyOf)));
        Map<UUID, Long> medicosPorUnidade = medicos.medicosPorUnidade().stream()
                .collect(Collectors.toMap(linha -> (UUID) linha[0], linha -> (Long) linha[1]));
        YearMonth mes = Periodos.mesAtual(relogio);
        Map<UUID, Long> movimento = agendamentos.totaisPorUnidade(Periodos.primeiroDia(mes), Periodos.ultimoDia(mes)).stream()
                .collect(Collectors.toMap(linha -> (UUID) linha[0], linha -> (Long) linha[1]));
        return unidades.findAllByOrderByNome().stream()
                .map(u -> UnidadeAdmin.de(u, especialidadesPorUnidade.getOrDefault(u.getId(), List.of()),
                        medicosPorUnidade.getOrDefault(u.getId(), 0L), movimento.getOrDefault(u.getId(), 0L))
                        .comEmailLogin(emailsLogin.get(u.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public MetricasDeUnidades metricasDeUnidades() {
        return new MetricasDeUnidades(unidades.count(), unidades.countByStatus(StatusUnidade.ATIVA),
                unidades.countByStatus(StatusUnidade.MANUTENCAO), unidades.countByStatus(StatusUnidade.INATIVA));
    }

    @Transactional
    public UnidadeAdmin criarUnidade(SalvarUnidade dados) {
        String cnpj = cnpj(dados.cnpj());
        if (cnpj != null && unidades.existsByCnpj(cnpj)) {
            throw new ConflitoException("Já existe uma unidade com este CNPJ.");
        }
        Unidade unidade = new Unidade(dados.nome(), dados.endereco(), dados.bairro(), dados.cidade(),
                dados.uf(), dados.telefone(), dados.horarioFuncionamento(), dados.mapUrl());
        unidade.alterarContato(cnpj, dados.email());
        unidades.save(unidade);
        Usuario conta = salvarAcesso(unidade, dados, true);
        auditoria.registrar("unidade.criar", "unidade", unidade.getId(), Map.of("nome", unidade.getNome()));
        return UnidadeAdmin.de(unidade, List.of(), 0, 0).comEmailLogin(conta.getEmail());
    }

    @Transactional
    public UnidadeAdmin alterarUnidade(UUID id, SalvarUnidade dados) {
        Unidade unidade = unidade(id);
        String cnpj = cnpj(dados.cnpj());
        if (cnpj != null && unidades.existsByCnpjAndIdNot(cnpj, id)) {
            throw new ConflitoException("Já existe uma unidade com este CNPJ.");
        }
        unidade.alterar(dados.nome(), dados.endereco(), dados.bairro(), dados.cidade(), dados.uf(), dados.telefone(),
                dados.horarioFuncionamento(), dados.mapUrl());
        unidade.alterarContato(cnpj, dados.email());
        salvarAcesso(unidade, dados, false);
        auditoria.registrar("unidade.alterar", "unidade", id, Map.of("nome", unidade.getNome()));
        return resumo(unidade);
    }

    /**
     * "Excluir" da tela: a unidade fica inativa. O registro fica, porque
     * agendamentos, exames e o histórico dos médicos apontam para ele.
     */
    @Transactional
    public void excluirUnidade(UUID id) {
        Unidade unidade = unidade(id);
        unidade.alterarStatus(StatusUnidade.INATIVA);
        auditoria.registrar("unidade.excluir", "unidade", id, Map.of("nome", unidade.getNome()));
    }

    private static String cnpj(String informado) {
        try {
            return Cnpj.normalizar(informado);
        } catch (IllegalArgumentException excecao) {
            throw RequisicaoInvalidaException.noCampo("cnpj", "CNPJ inválido.");
        }
    }

    /** Fora de `ativa`, a unidade some da busca e deixa de oferecer horários; consultas já marcadas continuam. */
    @Transactional
    public UnidadeAdmin alterarStatusDaUnidade(UUID id, StatusUnidade status) {
        Unidade unidade = unidade(id);
        unidade.alterarStatus(status);
        auditoria.registrar("unidade.status", "unidade", id, Map.of("status", status.chave()));
        return resumo(unidade);
    }

    @Transactional(readOnly = true)
    public UnidadeAdmin buscarUnidade(UUID id) {
        return resumo(unidade(id));
    }

    /** Conta e unidade são salvas na mesma transação; a senha nunca volta na resposta. */
    private Usuario salvarAcesso(Unidade unidade, SalvarUnidade dados, boolean nova) {
        Usuario conta = usuarios.findByUnidadeId(unidade.getId()).orElse(null);
        String email = dados.emailLogin();
        String senha = dados.senhaLogin();
        boolean temEmail = email != null && !email.isBlank();
        boolean temSenha = senha != null && !senha.isEmpty();
        if (!nova && conta == null && !temEmail && !temSenha) return null;
        if (conta == null && !temEmail) {
            throw RequisicaoInvalidaException.noCampo("emailLogin", "Informe o e-mail de login da clínica.");
        }
        if (conta == null && !temSenha) {
            throw RequisicaoInvalidaException.noCampo("senhaLogin", "Defina a senha de acesso da clínica.");
        }
        if (temSenha && (senha.length() < 8 || senha.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)) {
            throw RequisicaoInvalidaException.noCampo("senhaLogin", "Use pelo menos 8 caracteres e no máximo 72 bytes.");
        }
        if (temEmail) {
            email = Usuario.normalizarEmail(email);
            Usuario existente = usuarios.findByEmail(email).orElse(null);
            if (existente != null && (conta == null || !existente.getId().equals(conta.getId()))) {
                throw RequisicaoInvalidaException.noCampo("emailLogin", "Já existe uma conta com este e-mail.");
            }
        }
        if (conta == null) {
            conta = new Usuario(unidade.getNome(), email, codificador.encode(senha), unidade.getTelefone(), Papel.CLINICA);
            conta.vincularClinica(unidade);
        } else {
            if (temEmail) conta.alterarEmail(email);
            if (temSenha) conta.trocarSenha(codificador.encode(senha));
            conta.alterarCadastro(unidade.getNome(), unidade.getTelefone(), null);
        }
        try {
            usuarios.saveAndFlush(conta);
        } catch (DataIntegrityViolationException falha) {
            throw new ConflitoException("Não foi possível salvar o acesso: e-mail ou unidade já vinculados.");
        }
        return conta;
    }

    private UnidadeAdmin resumo(Unidade unidade) {
        return unidades().stream().filter(u -> u.id().equals(unidade.getId())).findFirst()
                .orElseGet(() -> UnidadeAdmin.de(unidade, List.of(), 0, 0));
    }

    private Unidade unidade(UUID id) {
        return unidades.findById(id).orElseThrow(() -> RecursoNaoEncontradoException.de("Unidade", id.toString()));
    }

    // ------------------------------------------------------------ especialidades

    @Transactional(readOnly = true)
    public List<EspecialidadeAdmin> especialidades() {
        return especialidades.findAllByOrderByNome().stream().map(EspecialidadeAdmin::de).toList();
    }

    /** O slug sai do nome ("Clínico Geral" → "clinico-geral") e não muda depois. */
    @Transactional
    public EspecialidadeAdmin criarEspecialidade(SalvarEspecialidade dados) {
        String slug = slug(dados.nome());
        if (especialidades.existsBySlug(slug)) {
            throw new ConflitoException("Já existe uma especialidade com esse nome.");
        }
        Especialidade nova = especialidades.save(new Especialidade(slug, dados.nome(), dados.descricao()));
        auditoria.registrar("especialidade.criar", "especialidade", nova.getId(), Map.of("nome", nova.getNome()));
        return EspecialidadeAdmin.de(nova);
    }

    @Transactional
    public EspecialidadeAdmin alterarEspecialidade(UUID id, SalvarEspecialidade dados) {
        Especialidade especialidade = especialidades.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Especialidade", id.toString()));
        especialidade.alterar(dados.nome(), dados.descricao());
        auditoria.registrar("especialidade.alterar", "especialidade", id, Map.of("nome", especialidade.getNome()));
        return EspecialidadeAdmin.de(especialidade);
    }

    // ------------------------------------------------------------------ convênios

    @Transactional(readOnly = true)
    public List<ConvenioAdmin> convenios() {
        return convenios.findAllByOrderByNome().stream().map(ConvenioAdmin::de).toList();
    }

    @Transactional
    public ConvenioAdmin criarConvenio(SalvarConvenio dados) {
        if (convenios.existsByNomeIgnoreCase(dados.nome().strip())) {
            throw new ConflitoException("Já existe um convênio com esse nome.");
        }
        Convenio novo = new Convenio(dados.nome());
        if (Boolean.FALSE.equals(dados.ativo())) {
            novo.alterar(dados.nome(), false);
        }
        convenios.save(novo);
        auditoria.registrar("convenio.criar", "convenio", novo.getId(), Map.of("nome", novo.getNome()));
        return ConvenioAdmin.de(novo);
    }

    @Transactional
    public ConvenioAdmin alterarConvenio(UUID id, SalvarConvenio dados) {
        Convenio convenio = convenios.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Convênio", id.toString()));
        if (convenios.existsByNomeIgnoreCaseAndIdNot(dados.nome().strip(), id)) {
            throw new ConflitoException("Já existe um convênio com esse nome.");
        }
        convenio.alterar(dados.nome(), dados.ativo() == null || dados.ativo());
        auditoria.registrar("convenio.alterar", "convenio", id, Map.of("nome", convenio.getNome(), "ativo", convenio.isAtivo()));
        return ConvenioAdmin.de(convenio);
    }

    // ------------------------------------------------------------- tipos de exame

    @Transactional(readOnly = true)
    public List<TipoExameAdmin> tiposDeExame() {
        return tiposDeExame.findAll(Sort.by("categoria", "nome")).stream()
                .map(TipoExameAdmin::de).toList();
    }

    @Transactional
    public TipoExameAdmin criarTipoDeExame(SalvarTipoExame dados) {
        if (tiposDeExame.existsByNomeIgnoreCase(dados.nome().strip())) {
            throw new ConflitoException("Já existe um exame com esse nome.");
        }
        TipoExame novo = tiposDeExame.save(new TipoExame(dados.nome(), dados.categoria(), dados.preparo(),
                dados.prazoResultadoDias()));
        auditoria.registrar("tipo_exame.criar", "tipo_exame", novo.getId(), Map.of("nome", novo.getNome()));
        return TipoExameAdmin.de(novo);
    }

    @Transactional
    public TipoExameAdmin alterarTipoDeExame(UUID id, SalvarTipoExame dados) {
        TipoExame tipo = tiposDeExame.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Tipo de exame", id.toString()));
        if (tiposDeExame.existsByNomeIgnoreCaseAndIdNot(dados.nome().strip(), id)) {
            throw new ConflitoException("Já existe um exame com esse nome.");
        }
        tipo.alterar(dados.nome(), dados.categoria(), dados.preparo(), dados.prazoResultadoDias());
        auditoria.registrar("tipo_exame.alterar", "tipo_exame", id, Map.of("nome", tipo.getNome()));
        return TipoExameAdmin.de(tipo);
    }

    /** "Clínico Geral" → "clinico-geral". */
    static String slug(String nome) {
        return Normalizer.normalize(nome.strip(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
