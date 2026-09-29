package br.com.saudeplus.security;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.stereotype.Component;

import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * Transforma um JWT com assinatura válida no usuário autenticado.
 *
 * Papel e situação da conta vêm do banco, não do token: como o JWT não pode
 * ser revogado, é isso que faz um bloqueio ou uma troca de papel valer na
 * próxima requisição, e não só quando o token expirar. O custo é uma busca
 * por chave primária por requisição.
 */
@Component
class ConversorDeJwt implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UsuarioRepository usuarios;

    ConversorDeJwt(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Usuario usuario = idDoToken(jwt)
                .flatMap(usuarios::findById)
                .orElseThrow(() -> new InvalidBearerTokenException("Token de um usuário que não existe."));
        if (!usuario.ativo()) {
            throw new DisabledException("Conta desativada.");
        }
        return new Autenticacao(UsuarioAutenticado.de(usuario), jwt);
    }

    private static Optional<UUID> idDoToken(Jwt jwt) {
        try {
            return Optional.of(UUID.fromString(jwt.getSubject()));
        } catch (IllegalArgumentException | NullPointerException excecao) {
            return Optional.empty();
        }
    }

    /** Authentication cujo principal é o {@link UsuarioAutenticado}. */
    static final class Autenticacao extends AbstractAuthenticationToken {

        private final UsuarioAutenticado usuario;
        private final Jwt jwt;

        Autenticacao(UsuarioAutenticado usuario, Jwt jwt) {
            super(List.of(new SimpleGrantedAuthority(usuario.papel().authority())));
            this.usuario = usuario;
            this.jwt = jwt;
            setAuthenticated(true);
        }

        @Override
        public UsuarioAutenticado getPrincipal() {
            return usuario;
        }

        @Override
        public Jwt getCredentials() {
            return jwt;
        }

        @Override
        public String getName() {
            return usuario.id().toString();
        }
    }
}
