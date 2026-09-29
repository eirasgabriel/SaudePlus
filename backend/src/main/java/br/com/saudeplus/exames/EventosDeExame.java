package br.com.saudeplus.exames;

import java.util.UUID;

/** Eventos do ciclo de um exame. Tratados depois do commit (notificações). */
public final class EventosDeExame {

    private EventosDeExame() {
    }

    public record ExameSolicitado(UUID exameId) {
    }

    public record ExameAgendado(UUID exameId) {
    }

    public record ResultadoLiberado(UUID exameId) {
    }
}
