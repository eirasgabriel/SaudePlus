package br.com.saudeplus.auditoria;

import java.time.Clock;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import br.com.saudeplus.security.UsuarioAutenticado;
import tools.jackson.databind.json.JsonMapper;

/**
 * Registro de atividades sensíveis (contas, permissões, configurações,
 * operação da clínica). Grava na transação de quem chama: se a ação não for
 * confirmada, o registro também não fica.
 *
 * Quem fez vem do usuário autenticado; o IP, do endereço da conexão (não de
 * `X-Forwarded-For`, que o cliente pode forjar — atrás de um proxy confiável,
 * configure `server.forward-headers-strategy`).
 */
@Component
public class Auditoria {

    private final RegistroAtividadeRepository registros;
    private final JsonMapper json;
    private final Clock relogio;

    public Auditoria(RegistroAtividadeRepository registros, JsonMapper json, Clock relogio) {
        this.registros = registros;
        this.json = json;
        this.relogio = relogio;
    }

    public void registrar(String acao, String entidade, UUID entidadeId, Map<String, ?> detalhe) {
        registrar(usuarioAtual(), acao, entidade, entidadeId, detalhe);
    }

    /** Para ações sem usuário no contexto ainda (o próprio login). */
    public void registrar(UUID usuarioId, String acao, String entidade, UUID entidadeId, Map<String, ?> detalhe) {
        String texto = detalhe == null || detalhe.isEmpty() ? null : json.writeValueAsString(detalhe);
        registros.save(new RegistroAtividade(usuarioId, acao, entidade, entidadeId, texto, ipAtual(), relogio.instant()));
    }

    private static UUID usuarioAtual() {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();
        return autenticacao != null && autenticacao.getPrincipal() instanceof UsuarioAutenticado usuario
                ? usuario.id()
                : null;
    }

    private static String ipAtual() {
        return RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes atributos
                ? atributos.getRequest().getRemoteAddr()
                : null;
    }
}
