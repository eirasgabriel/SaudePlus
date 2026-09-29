package br.com.saudeplus.security;

import java.time.Clock;
import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import br.com.saudeplus.usuarios.Usuario;

/**
 * Emite o JWT de acesso (HS256) com os claims combinados em `docs/api.md`:
 * `sub`, `email`, `role`, `nome`, `iat` e `exp`. Nada sensível vai no token,
 * porque ele é assinado, não criptografado.
 */
@Service
public class JwtService {

    private final JwtEncoder codificador;
    private final JwtPropriedades propriedades;
    private final Clock relogio;

    public JwtService(JwtEncoder codificador, JwtPropriedades propriedades, Clock relogio) {
        this.codificador = codificador;
        this.propriedades = propriedades;
        this.relogio = relogio;
    }

    public TokenEmitido emitir(Usuario usuario) {
        Instant agora = relogio.instant();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(usuario.getId().toString())
                .issuedAt(agora)
                .expiresAt(agora.plus(propriedades.validade()))
                .claim("email", usuario.getEmail())
                .claim("role", usuario.getPapel().name())
                .claim("nome", usuario.getNomeCompleto())
                .build();
        JwsHeader cabecalho = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = codificador.encode(JwtEncoderParameters.from(cabecalho, claims)).getTokenValue();
        return new TokenEmitido(token, propriedades.validade().toSeconds());
    }

    public record TokenEmitido(String token, long expiraEmSegundos) {
    }
}
