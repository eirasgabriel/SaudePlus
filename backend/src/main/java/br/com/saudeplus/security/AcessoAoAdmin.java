package br.com.saudeplus.security;

import java.util.function.Supplier;

import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationResult;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

import br.com.saudeplus.configuracoes.ModuloAdmin;
import br.com.saudeplus.configuracoes.PermissoesService;
import br.com.saudeplus.usuarios.Papel;

/**
 * Quem entra em `/api/admin/**`: ADMIN sempre; papéis de equipe (gestor,
 * recepção...) só nos módulos liberados na matriz de permissões. Rotas que
 * não pertencem a nenhum módulo (permissões, auditoria) são só do ADMIN.
 */
@Component
class AcessoAoAdmin implements AuthorizationManager<RequestAuthorizationContext> {

    private final PermissoesService permissoes;

    AcessoAoAdmin(PermissoesService permissoes) {
        this.permissoes = permissoes;
    }

    @Override
    public AuthorizationResult authorize(Supplier<? extends Authentication> autenticacao,
            RequestAuthorizationContext contexto) {
        if (!(autenticacao.get() != null && autenticacao.get().getPrincipal() instanceof UsuarioAutenticado usuario)) {
            return new AuthorizationDecision(false);
        }
        boolean liberado = ModuloAdmin.doCaminho(contexto.getRequest().getRequestURI())
                .map(modulo -> permissoes.permite(usuario.papel(), modulo))
                .orElse(usuario.papel() == Papel.ADMIN);
        return new AuthorizationDecision(liberado);
    }
}
