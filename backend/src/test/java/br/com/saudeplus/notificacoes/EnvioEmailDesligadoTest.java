package br.com.saudeplus.notificacoes;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EnvioEmailDesligadoTest {

    @Test
    void mascaraOEnderecoMantendoODominio() {
        assertThat(EnvioEmailDesligado.mascarar("maria.souza@exemplo.com")).isEqualTo("m***@exemplo.com");
    }

    @Test
    void enderecoSemArrobaOuNuloNaoVaza() {
        assertThat(EnvioEmailDesligado.mascarar("semarroba")).isEqualTo("***");
        assertThat(EnvioEmailDesligado.mascarar("@dominio.com")).isEqualTo("***");
        assertThat(EnvioEmailDesligado.mascarar(null)).isEqualTo("(sem destinatário)");
    }
}
