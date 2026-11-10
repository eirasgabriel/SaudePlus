package br.com.saudeplus.notificacoes.dto;

import java.time.Instant;
import java.util.UUID;

import br.com.saudeplus.notificacoes.Notificacao;
import br.com.saudeplus.notificacoes.TipoNotificacao;

/** `quando` vem pronto para exibir ("Hoje, 09:15"); `criadaEm` é o instante exato. */
public record NotificacaoResposta(
        UUID id,
        TipoNotificacao tipo,
        String titulo,
        String detalhe,
        String quando,
        Instant criadaEm,
        boolean lida) {

    public static NotificacaoResposta de(Notificacao notificacao, String quando) {
        return new NotificacaoResposta(
                notificacao.getId(),
                notificacao.getTipo(),
                notificacao.getTitulo(),
                notificacao.getDetalhe(),
                quando,
                notificacao.getCriadaEm(),
                notificacao.isLida());
    }
}
