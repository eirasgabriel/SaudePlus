package br.com.saudeplus.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.notificacoes.EnvioEmail;
import br.com.saudeplus.usuarios.Usuario;
import br.com.saudeplus.usuarios.UsuarioRepository;

/**
 * "Esqueci minha senha": emite um link de uso único e curta validade e, com
 * ele, grava a senha nova. Regras em `docs/api.md`.
 */
@Service
public class RecuperacaoDeSenhaService {

    private final UsuarioRepository usuarios;
    private final TokenRedefinicaoSenhaRepository tokens;
    private final PasswordEncoder codificador;
    private final EnvioEmail email;
    private final Clock relogio;
    private final String urlDoFront;
    private final Duration validade;

    public RecuperacaoDeSenhaService(
            UsuarioRepository usuarios,
            TokenRedefinicaoSenhaRepository tokens,
            PasswordEncoder codificador,
            EnvioEmail email,
            Clock relogio,
            @Value("${saudeplus.front-url}") String urlDoFront,
            @Value("${saudeplus.redefinicao-senha.validade:30m}") Duration validade) {
        this.usuarios = usuarios;
        this.tokens = tokens;
        this.codificador = codificador;
        this.email = email;
        this.relogio = relogio;
        this.urlDoFront = urlDoFront.replaceAll("/+$", "");
        this.validade = validade;
    }

    /**
     * Não informa se a conta existe: quem chama responde a mesma mensagem nos
     * dois casos, para a rota não virar um consultor de e-mails cadastrados.
     */
    @Transactional
    public void solicitar(String enderecoInformado) {
        usuarios.findByEmail(Usuario.normalizarEmail(enderecoInformado))
                .filter(Usuario::ativo)
                .ifPresent(this::emitirLink);
    }

    @Transactional
    public void redefinir(String tokenEmClaro, String novaSenha) {
        Instant agora = relogio.instant();
        TokenRedefinicaoSenha token = tokens.findByHashSha256(TokenRedefinicaoSenha.hash(tokenEmClaro))
                .filter(encontrado -> encontrado.utilizavelEm(agora))
                .orElseThrow(() -> new RequisicaoInvalidaException("Link inválido",
                        "Este link de redefinição é inválido ou expirou. Peça um novo."));
        token.consumir(agora);
        token.getUsuario().trocarSenha(codificador.encode(novaSenha));
    }

    private void emitirLink(Usuario usuario) {
        tokens.apagarPendentesDoUsuario(usuario.getId());
        Instant agora = relogio.instant();
        String tokenEmClaro = TokenRedefinicaoSenha.gerarTokenEmClaro();
        tokens.save(new TokenRedefinicaoSenha(usuario, tokenEmClaro, agora, agora.plus(validade)));

        String link = "%s/redefinir-senha?token=%s".formatted(urlDoFront, tokenEmClaro);
        email.enviar(usuario.getEmail(), "Redefinição de senha — SaudePlus", """
                Olá, %s.

                Recebemos um pedido para redefinir a sua senha. Use o link abaixo em até %d minutos:

                %s

                Se não foi você, ignore este e-mail: a sua senha continua a mesma.""".formatted(
                usuario.getNomeCompleto(), validade.toMinutes(), link));
    }
}
