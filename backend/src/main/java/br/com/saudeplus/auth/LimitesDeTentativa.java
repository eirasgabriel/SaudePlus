package br.com.saudeplus.auth;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * `saudeplus.limites.*`: quantas tentativas cabem em cada janela antes de 429.
 *
 * @param loginPorConta falhas de login para o mesmo e-mail vindas do mesmo IP
 * @param loginPorIp falhas de login de um IP, somando todos os e-mails
 * @param recuperacaoPorConta pedidos de recuperação de senha para o mesmo e-mail
 * @param recuperacaoPorIp pedidos de recuperação de senha de um IP
 */
@ConfigurationProperties("saudeplus.limites")
public record LimitesDeTentativa(Limite loginPorConta, Limite loginPorIp, Limite recuperacaoPorConta,
        Limite recuperacaoPorIp) {

    public record Limite(int maximo, Duration janela) {
    }

    public LimitesDeTentativa {
        loginPorConta = padrao(loginPorConta, 5, Duration.ofMinutes(15));
        loginPorIp = padrao(loginPorIp, 30, Duration.ofMinutes(15));
        recuperacaoPorConta = padrao(recuperacaoPorConta, 3, Duration.ofHours(1));
        recuperacaoPorIp = padrao(recuperacaoPorIp, 10, Duration.ofHours(1));
    }

    private static Limite padrao(Limite limite, int maximo, Duration janela) {
        return limite == null || limite.janela() == null ? new Limite(maximo, janela) : limite;
    }
}
