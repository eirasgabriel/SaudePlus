package br.com.saudeplus.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AuthServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    void loginAcceptsValidAdminCredentials() {
        Map<String, Object> response = authService.login(new LoginRequest("admin@saudeplus.com", "admin123"));

        assertThat(response)
                .containsEntry("usuarioId", 1)
                .containsEntry("nome", "Admin Master")
                .containsEntry("email", "admin@saudeplus.com")
                .containsEntry("cargo", "Administrador");

        assertThat(response)
                .containsKey("token")
                .extracting("token")
                .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.STRING)
                .isNotBlank();
    }

    @Test
    void loginRejectsWrongPassword() {
        assertThatThrownBy(() -> authService.login(new LoginRequest("admin@saudeplus.com", "senha-errada")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Credenciais inválidas");
    }
}
