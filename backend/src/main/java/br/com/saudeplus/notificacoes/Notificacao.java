package br.com.saudeplus.notificacoes;

/** Aviso exibido no painel do profissional. */
public record Notificacao(
        String id,
        String medicoId,
        TipoNotificacao tipo,
        String titulo,
        String detalhe,
        String quando,
        boolean lida) {
}
