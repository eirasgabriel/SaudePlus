package br.com.saudeplus.auth;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.auth.dto.AtualizarPerfilRequisicao;
import br.com.saudeplus.auth.dto.AuthResposta;
import br.com.saudeplus.auth.dto.CadastroRequisicao;
import br.com.saudeplus.auth.dto.LoginRequisicao;
import br.com.saudeplus.auth.dto.MensagemResposta;
import br.com.saudeplus.auth.dto.RecuperarSenhaRequisicao;
import br.com.saudeplus.auth.dto.RedefinirSenhaRequisicao;
import br.com.saudeplus.auth.dto.TrocarSenhaRequisicao;
import br.com.saudeplus.auth.dto.UsuarioResposta;
import br.com.saudeplus.configuracoes.ModuloAdmin;
import br.com.saudeplus.configuracoes.PermissoesService;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.Papel;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/** Contrato em `docs/api.md`. Chamado por `frontend/src/features/auth/auth.api.js`. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final RecuperacaoDeSenhaService recuperacao;
    private final PermissoesService permissoes;
    private final ProtecaoContraForcaBruta protecao;

    public AuthController(AuthService auth, RecuperacaoDeSenhaService recuperacao, PermissoesService permissoes,
            ProtecaoContraForcaBruta protecao) {
        this.auth = auth;
        this.recuperacao = recuperacao;
        this.permissoes = permissoes;
        this.protecao = protecao;
    }

    /** Falhas seguidas do mesmo IP recebem 429 (ver {@link ProtecaoContraForcaBruta}). */
    @PostMapping("/login")
    public AuthResposta entrar(@Valid @RequestBody LoginRequisicao requisicao, HttpServletRequest http) {
        return protecao.login(http.getRemoteAddr(), requisicao.email(), () -> auth.entrar(requisicao));
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResposta cadastrar(@Valid @RequestBody CadastroRequisicao requisicao) {
        return auth.cadastrarPaciente(requisicao);
    }

    @PostMapping("/recuperar-senha")
    public MensagemResposta recuperarSenha(@Valid @RequestBody RecuperarSenhaRequisicao requisicao,
            HttpServletRequest http) {
        protecao.recuperacao(http.getRemoteAddr(), requisicao.email());
        recuperacao.solicitar(requisicao.email());
        return new MensagemResposta("Se existir uma conta com este e-mail, enviamos as instruções de recuperação.");
    }

    @PostMapping("/redefinir-senha")
    public MensagemResposta redefinirSenha(@Valid @RequestBody RedefinirSenhaRequisicao requisicao) {
        recuperacao.redefinir(requisicao.token(), requisicao.senha());
        return new MensagemResposta("Senha alterada com sucesso. Use a nova senha para entrar.");
    }

    @GetMapping("/perfil")
    public UsuarioResposta perfil(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return auth.perfil(usuario.id());
    }

    @PutMapping("/perfil")
    public UsuarioResposta atualizarPerfil(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody AtualizarPerfilRequisicao requisicao) {
        return auth.atualizarPerfil(usuario.id(), requisicao);
    }

    /**
     * Módulos da área administrativa que quem está logado pode abrir: todos
     * para ADMIN, os da matriz de permissões para a equipe, nenhum para os demais.
     */
    @GetMapping("/modulos")
    public List<ModuloAdmin> modulos(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return usuario.papel() == Papel.PACIENTE ? List.of() : permissoes.modulosDe(usuario.papel());
    }

    @PutMapping("/senha")
    public MensagemResposta trocarSenha(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody TrocarSenhaRequisicao requisicao) {
        auth.trocarSenha(usuario.id(), requisicao);
        return new MensagemResposta("Senha alterada com sucesso.");
    }
}
