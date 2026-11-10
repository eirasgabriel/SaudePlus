package br.com.saudeplus.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.security.UsuarioAutenticado;

/**
 * Caixa de notificações de quem está na área administrativa (o sino do
 * cabeçalho). Não é módulo da matriz: toda a equipe acessa a sua, e só a sua
 * (ver `AcessoAoAdmin`). Notificação de outra pessoa responde 404.
 */
@RestController
@RequestMapping("/api/admin/notificacoes")
public class NotificacoesAdminController {

    private final NotificacaoService notificacoes;

    public NotificacoesAdminController(NotificacaoService notificacoes) {
        this.notificacoes = notificacoes;
    }

    public record NaoLidas(long total) {
    }

    @GetMapping
    public List<NotificacaoResposta> listar(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return notificacoes.doUsuario(usuario.id());
    }

    /** Número do sino, sem trazer a lista. */
    @GetMapping("/nao-lidas")
    public NaoLidas naoLidas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return new NaoLidas(notificacoes.naoLidas(usuario.id()));
    }

    @PatchMapping("/{id}/lida")
    public NotificacaoResposta marcarComoLida(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id) {
        return notificacoes.marcarComoLida(usuario.id(), id);
    }

    @PatchMapping("/lidas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarTodasComoLidas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        notificacoes.marcarTodasComoLidas(usuario.id());
    }
}
