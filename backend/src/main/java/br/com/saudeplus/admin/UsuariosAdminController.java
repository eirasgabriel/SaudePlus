package br.com.saudeplus.admin;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.admin.dto.RequisicoesAdmin.AlterarStatusDoUsuario;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.AlterarUsuario;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.CriarUsuario;
import br.com.saudeplus.admin.dto.UsuarioAdminResposta;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.Papel;
import br.com.saudeplus.usuarios.StatusConta;
import jakarta.validation.Valid;

/** Módulo "usuarios" da administração. */
@RestController
@RequestMapping("/api/admin/usuarios")
public class UsuariosAdminController {

    private final UsuariosAdminService usuarios;

    public UsuariosAdminController(UsuariosAdminService usuarios) {
        this.usuarios = usuarios;
    }

    /** `papel` (ex.: MEDICO) e `status` (ex.: bloqueado) filtram; `q` procura em nome, e-mail e CPF. */
    @GetMapping
    public Pagina<UsuarioAdminResposta> listar(@RequestParam(required = false) String q,
            @RequestParam(required = false) Papel papel, @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "50") int tamanho) {
        return usuarios.listar(q, papel, status == null || status.isBlank() ? null : statusDaConta(status), pagina, tamanho);
    }

    @GetMapping("/metricas")
    public UsuarioAdminResposta.Metricas metricas() {
        return usuarios.metricas();
    }

    @GetMapping("/{id}")
    public UsuarioAdminResposta detalhe(@PathVariable UUID id) {
        return usuarios.detalhe(id);
    }

    /** Cria a conta e envia o convite para a pessoa definir a senha. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioAdminResposta criar(@AuthenticationPrincipal UsuarioAutenticado ator,
            @Valid @RequestBody CriarUsuario requisicao) {
        return usuarios.criar(ator, requisicao);
    }

    @PutMapping("/{id}")
    public UsuarioAdminResposta alterar(@AuthenticationPrincipal UsuarioAutenticado ator, @PathVariable UUID id,
            @Valid @RequestBody AlterarUsuario requisicao) {
        return usuarios.alterar(ator, id, requisicao);
    }

    @PatchMapping("/{id}/status")
    public UsuarioAdminResposta alterarStatus(@AuthenticationPrincipal UsuarioAutenticado ator, @PathVariable UUID id,
            @Valid @RequestBody AlterarStatusDoUsuario requisicao) {
        return usuarios.alterarStatus(ator, id, requisicao.status());
    }

    /**
     * Exclusão lógica: a conta fica inativa e não entra mais. Consultas,
     * exames e cobranças continuam ligados a ela (prontuário se guarda por 20 anos).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal UsuarioAutenticado ator, @PathVariable UUID id) {
        usuarios.alterarStatus(ator, id, StatusConta.INATIVO);
    }

    @PostMapping("/{id}/convite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reenviarConvite(@AuthenticationPrincipal UsuarioAutenticado ator, @PathVariable UUID id) {
        usuarios.reenviarConvite(ator, id);
    }

    private static StatusConta statusDaConta(String chave) {
        for (StatusConta status : StatusConta.values()) {
            if (status.chave().equalsIgnoreCase(chave) || status.name().equalsIgnoreCase(chave)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Status de conta desconhecido: " + chave);
    }
}
