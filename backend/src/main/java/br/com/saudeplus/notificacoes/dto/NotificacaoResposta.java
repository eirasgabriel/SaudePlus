package br.com.saudeplus.notificacoes.dto;

import br.com.saudeplus.notificacoes.Notificacao;
import br.com.saudeplus.notificacoes.TipoNotificacao;

public record NotificacaoResposta(
        String id,
        TipoNotificacao tipo,
        String titulo,
        String detalhe,
        String quando,
        boolean lida) {

    public static NotificacaoResposta de(Notificacao notificacao) {
        return new NotificacaoResposta(
                notificacao.id(),
                notificacao.tipo(),
                notificacao.titulo(),
                notificacao.detalhe(),
                notificacao.quando(),
                notificacao.lida());
    }
}
