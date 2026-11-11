package br.com.saudeplus.auth;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Clock;
import java.util.EnumSet;
import java.util.Set;
import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import br.com.saudeplus.arquivos.ArmazenamentoArquivos;
import br.com.saudeplus.arquivos.TipoDeArquivo;

import br.com.saudeplus.auth.dto.AtualizarPerfilRequisicao;
import br.com.saudeplus.auth.dto.AuthResposta;
import br.com.saudeplus.auth.dto.CadastroRequisicao;
import br.com.saudeplus.auth.dto.LoginRequisicao;
import br.com.saudeplus.auth.dto.TrocarSenhaRequisicao;
import br.com.saudeplus.auth.dto.UsuarioResposta;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.exception.AcessoProibidoException;
import br.com.saudeplus.exception.ConflitoException;
import br.com.saudeplus.exception.NaoAutorizadoException;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.security.JwtService;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/** Login, cadastro público de paciente e manutenção da própria conta. */
@Service
public class AuthService {

    /** Mesma mensagem para e-mail inexistente e senha errada: a rota não revela quais contas existem. */
    static final String CREDENCIAIS_INVALIDAS = "Dados incorretos. Confira o e-mail e a senha.";

    private final UsuarioRepository usuarios;
    private final PacienteRepository pacientes;
    private final PasswordEncoder codificador;
    private final JwtService jwt;
    private final Clock relogio;
    private final Auditoria auditoria;
    private final ArmazenamentoArquivos armazenamento;

    /** Foto de perfil: PNG, JPEG ou WebP, até 2 MB. */
    static final long TAMANHO_MAXIMO_DA_FOTO = 2L * 1024 * 1024;

    private static final Set<TipoDeArquivo> FORMATOS_DA_FOTO =
            EnumSet.of(TipoDeArquivo.PNG, TipoDeArquivo.JPEG, TipoDeArquivo.WEBP);

    /** Endereço público de uma foto enviada (ver PublicoController#foto). */
    public static String urlDaFoto(String chave) {
        return "/api/publico/fotos/" + chave;
    }

    /**
     * Hash comparado quando o e-mail não existe, para gastar o mesmo BCrypt
     * de uma conta real e não denunciar a diferença pelo tempo de resposta.
     */
    private final String hashFicticio;

    public AuthService(UsuarioRepository usuarios, PacienteRepository pacientes, PasswordEncoder codificador,
            JwtService jwt, Clock relogio, Auditoria auditoria, ArmazenamentoArquivos armazenamento) {
        this.usuarios = usuarios;
        this.pacientes = pacientes;
        this.codificador = codificador;
        this.jwt = jwt;
        this.relogio = relogio;
        this.auditoria = auditoria;
        this.armazenamento = armazenamento;
        this.hashFicticio = codificador.encode(UUID.randomUUID().toString());
    }

    @Transactional
    public AuthResposta entrar(LoginRequisicao requisicao) {
        Optional<Usuario> encontrado = usuarios.findByEmail(Usuario.normalizarEmail(requisicao.email()));
        String hash = encontrado.map(Usuario::getSenhaHash).orElse(hashFicticio);
        boolean senhaConfere = codificador.matches(requisicao.senha(), hash);
        if (encontrado.isEmpty() || !senhaConfere) {
            throw new NaoAutorizadoException(CREDENCIAIS_INVALIDAS);
        }
        Usuario usuario = encontrado.get();
        // Só depois da senha certa: quem não sabe a senha não descobre que a conta existe.
        if (!usuario.ativo()) {
            throw new AcessoProibidoException("Sua conta está desativada. Procure o suporte.");
        }
        usuario.registrarAcesso(relogio.instant());
        if (usuario.getPapel() == Papel.CLINICA &&
                !usuarios.existsByIdAndUnidadeStatus(usuario.getId(), br.com.saudeplus.clinicas.StatusUnidade.ATIVA)) {
            throw new AcessoProibidoException("A unidade clínica está desativada. Procure a administração.");
        }
        auditoria.registrar(usuario.getId(), "login", "usuario", usuario.getId(), null);
        return autenticar(usuario);
    }

    @Transactional
    public AuthResposta cadastrarPaciente(CadastroRequisicao requisicao) {
        String email = Usuario.normalizarEmail(requisicao.email());
        if (usuarios.existsByEmail(email)) {
            throw emailEmUso();
        }
        Usuario usuario = new Usuario(
                requisicao.nomeCompleto(), email, codificador.encode(requisicao.senha()),
                requisicao.telefone(), Papel.PACIENTE);
        usuario.registrarAcesso(relogio.instant());
        try {
            // Dois cadastros simultâneos com o mesmo e-mail passam pelo exists;
            // o índice único do banco decide, e o flush traz a violação para cá.
            usuarios.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException excecao) {
            throw emailEmUso();
        }
        pacientes.save(new Paciente(usuario));
        return autenticar(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResposta perfil(UUID usuarioId) {
        return UsuarioResposta.de(buscar(usuarioId));
    }

    @Transactional
    public UsuarioResposta atualizarPerfil(UUID usuarioId, AtualizarPerfilRequisicao requisicao) {
        Usuario usuario = buscar(usuarioId);
        usuario.atualizarPerfil(requisicao.nomeCompleto(), requisicao.telefone(), requisicao.fotoUrl());
        if (requisicao.exibirFotoNoPainel() != null) {
            usuario.exibirFotoNoPainel(requisicao.exibirFotoNoPainel());
        }
        // Trocou a foto enviada por um endereço https (ou apagou): o arquivo antigo sai.
        if (usuario.getFotoChave() != null) {
            String solta = usuario.soltarFotoEnviadaSeTrocada(urlDaFoto(usuario.getFotoChave()));
            apagarDepoisDoCommit(solta);
        }
        return UsuarioResposta.de(usuario);
    }

    /**
     * Guarda a foto enviada do computador e passa a usá-la como foto de perfil.
     * PNG, JPEG ou WebP (conferido pelos bytes, não pela extensão), até 2 MB. A foto
     * anterior enviada por aqui é apagada depois que a troca é gravada.
     */
    @Transactional
    public UsuarioResposta enviarFoto(UUID usuarioId, MultipartFile arquivo) {
        Usuario usuario = buscar(usuarioId);
        if (arquivo == null || arquivo.isEmpty()) {
            throw RequisicaoInvalidaException.noCampo("arquivo", "Escolha uma imagem PNG, JPG ou WebP.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_DA_FOTO) {
            throw RequisicaoInvalidaException.noCampo("arquivo", "A imagem deve ter até 2 MB.");
        }
        byte[] conteudo;
        try {
            conteudo = arquivo.getBytes();
        } catch (IOException excecao) {
            throw new UncheckedIOException("Não foi possível ler o arquivo enviado.", excecao);
        }
        TipoDeArquivo tipo = TipoDeArquivo.detectar(conteudo)
                .filter(FORMATOS_DA_FOTO::contains)
                .orElseThrow(() -> RequisicaoInvalidaException.noCampo("arquivo",
                        "Envie uma imagem PNG, JPG ou WebP."));
        String chave = armazenamento.guardar(conteudo, tipo);
        // Se a transação falhar, o arquivo novo não fica órfão.
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    armazenamento.remover(chave);
                }
            }
        });
        apagarDepoisDoCommit(usuario.definirFotoEnviada(chave, urlDaFoto(chave)));
        auditoria.registrar(usuarioId, "usuario.foto", "usuario", usuarioId, null);
        return UsuarioResposta.de(usuario);
    }

    private void apagarDepoisDoCommit(String chave) {
        if (chave == null) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                armazenamento.remover(chave);
            }
        });
    }

    @Transactional
    public void trocarSenha(UUID usuarioId, TrocarSenhaRequisicao requisicao) {
        Usuario usuario = buscar(usuarioId);
        // 400 no campo, não 401: o front trata 401 como sessão expirada e deslogaria.
        if (!codificador.matches(requisicao.senhaAtual(), usuario.getSenhaHash())) {
            throw RequisicaoInvalidaException.noCampo("senhaAtual", "A senha atual não confere.");
        }
        usuario.trocarSenha(codificador.encode(requisicao.novaSenha()));
    }

    private AuthResposta autenticar(Usuario usuario) {
        JwtService.TokenEmitido token = jwt.emitir(usuario);
        return AuthResposta.bearer(token.token(), token.expiraEmSegundos(), UsuarioResposta.de(usuario));
    }

    private Usuario buscar(UUID usuarioId) {
        return usuarios.findById(usuarioId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Usuário", usuarioId.toString()));
    }

    private static ConflitoException emailEmUso() {
        return new ConflitoException("Já existe uma conta com este e-mail.");
    }
}
