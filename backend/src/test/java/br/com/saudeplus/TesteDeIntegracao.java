package br.com.saudeplus;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Sobe a aplicação inteira contra um Postgres do Testcontainers, com as
 * migrações do Flyway aplicadas. Precisa do Docker rodando.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@Import(TestcontainersConfig.class)
@ActiveProfiles("test")
public @interface TesteDeIntegracao {
}
