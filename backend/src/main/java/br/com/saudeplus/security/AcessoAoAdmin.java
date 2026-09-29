package br.com.saudeplus.security;

import java.util.EnumSet;
import java.util.Set;
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
 *
 * Exceção: rotas pessoais (as notificações de quem está logado) valem para
 * toda a equipe, sem depender da matriz. Médico e paciente têm as suas nas
 * próprias áreas.
 */
@Component
class AcessoAoAdmin implements AuthorizationManager<RequestAuthorizationContext> {

    private static final String ROTAS_PESSOAIS = "/api/admin/notificacoes";

    private static final Set<Papel> EQUIPE =
            EnumSet.of(Papel.ADMIN, Papel.GESTOR, Papel.ENFERMEIRO, Papel.RECEPCIONISTA, Papel.AGENTE);

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
        String caminho = contexto.getRequest().getRequestURI();
        if (caminho.equals(ROTAS_PESSOAIS) || caminho.startsWith(ROTAS_PESSOAIS + "/")) {
            return new AuthorizationDecision(EQUIPE.contains(usuario.papel()));
        }
        boolean liberado = ModuloAdmin.doCaminho(caminho)
                .map(modulo -> permissoes.permite(usuario.papel(), modulo))
                .orElse(usuario.papel() == Papel.ADMIN);
        return new AuthorizationDecision(liberado);
    }
}
