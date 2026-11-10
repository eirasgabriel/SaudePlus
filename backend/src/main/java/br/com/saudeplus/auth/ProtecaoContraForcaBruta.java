package br.com.saudeplus.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

import org.springframework.stereotype.Component;

import br.com.saudeplus.auth.LimitesDeTentativa.Limite;
import br.com.saudeplus.exception.MuitasTentativasException;
import br.com.saudeplus.exception.NaoAutorizadoException;

/**
 * Limita tentativas de login e pedidos de recuperação de senha, contra
 * adivinhação de senha e bombardeio de e-mails.
 *
 * - Login: conta só as falhas, por IP + e-mail e por IP. Um login certo zera
 *   o contador daquele e-mail naquele IP.
 * - Recuperação: conta todo pedido, por e-mail e por IP. Vale exista a conta
 *   ou não, então o 429 não revela quais e-mails estão cadastrados.
 *
 * Janela deslizante em memória: vale por instância. Com mais de uma instância
 * atrás de um balanceador, troque por um armazenamento compartilhado (Redis).
 * Atrás de proxy, configure `server.forward-headers-strategy` para o IP ser o
 * do cliente.
 */
@Component
public class ProtecaoContraForcaBruta {

    /** Acima disto, cada registro novo aproveita para descartar as chaves já vencidas. */
    private static final int CHAVES_ANTES_DE_LIMPAR = 10_000;

    private final LimitesDeTentativa limites;
    private final Clock relogio;
    private final Map<String, Deque<Instant>> tentativas = new ConcurrentHashMap<>();

    public ProtecaoContraForcaBruta(LimitesDeTentativa limites, Clock relogio) {
        this.limites = limites;
        this.relogio = relogio;
    }

    public <T> T login(String ip, String email, Supplier<T> entrar) {
        String porConta = "login|" + ip + "|" + normalizar(email);
        String porIp = "login-ip|" + ip;
        exigirDentroDoLimite(porConta, limites.loginPorConta());
        exigirDentroDoLimite(porIp, limites.loginPorIp());
        try {
            T resultado = entrar.get();
            tentativas.remove(porConta);
            return resultado;
        } catch (NaoAutorizadoException falha) {
            registrar(porConta, limites.loginPorConta());
            registrar(porIp, limites.loginPorIp());
            throw falha;
        }
    }

    public void recuperacao(String ip, String email) {
        String porConta = "recuperacao|" + normalizar(email);
        String porIp = "recuperacao-ip|" + ip;
        exigirDentroDoLimite(porConta, limites.recuperacaoPorConta());
        exigirDentroDoLimite(porIp, limites.recuperacaoPorIp());
        registrar(porConta, limites.recuperacaoPorConta());
        registrar(porIp, limites.recuperacaoPorIp());
    }

    private void exigirDentroDoLimite(String chave, Limite limite) {
        Instant agora = relogio.instant();
        Deque<Instant> registros = tentativas.get(chave);
        if (registros == null) {
            return;
        }
        synchronized (registros) {
            descartarVencidas(registros, agora, limite.janela());
            if (registros.size() >= limite.maximo()) {
                Duration aguardar = Duration.between(agora, registros.peekFirst().plus(limite.janela()));
                long minutos = Math.max(1, (aguardar.toSeconds() + 59) / 60);
                throw new MuitasTentativasException(
                        "Muitas tentativas seguidas. Aguarde %d minuto%s e tente de novo."
                                .formatted(minutos, minutos == 1 ? "" : "s"),
                        aguardar.isNegative() ? Duration.ZERO : aguardar);
            }
        }
    }

    private void registrar(String chave, Limite limite) {
        Instant agora = relogio.instant();
        Deque<Instant> registros = tentativas.computeIfAbsent(chave, c -> new ArrayDeque<>());
        synchronized (registros) {
            descartarVencidas(registros, agora, limite.janela());
            registros.addLast(agora);
        }
        if (tentativas.size() > CHAVES_ANTES_DE_LIMPAR) {
            limparVencidas(agora);
        }
    }

    private static void descartarVencidas(Deque<Instant> registros, Instant agora, Duration janela) {
        while (!registros.isEmpty() && !registros.peekFirst().plus(janela).isAfter(agora)) {
            registros.pollFirst();
        }
    }

    /** Remove as chaves sem registro recente; a maior janela configurada é o corte. */
    private void limparVencidas(Instant agora) {
        Duration maiorJanela = maior(limites.loginPorConta().janela(), limites.loginPorIp().janela(),
                limites.recuperacaoPorConta().janela(), limites.recuperacaoPorIp().janela());
        tentativas.entrySet().removeIf(entrada -> {
            synchronized (entrada.getValue()) {
                Instant ultima = entrada.getValue().peekLast();
                return ultima == null || !ultima.plus(maiorJanela).isAfter(agora);
            }
        });
    }

    private static Duration maior(Duration... janelas) {
        Duration maior = Duration.ZERO;
        for (Duration janela : janelas) {
            if (janela.compareTo(maior) > 0) {
                maior = janela;
            }
        }
        return maior;
    }

    private static String normalizar(String email) {
        return email == null ? "" : email.strip().toLowerCase(Locale.ROOT);
    }
}
