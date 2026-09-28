package br.com.saudeplus.notificacoes;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacoes;

    public NotificacaoService(NotificacaoRepository notificacoes) {
        this.notificacoes = notificacoes;
    }

    public List<NotificacaoResposta> doMedico(String medicoId) {
        return notificacoes.porMedico(medicoId).stream().map(NotificacaoResposta::de).toList();
    }

    /** Quantas ainda não foram lidas — é o número do sino no cabeçalho. */
    public int naoLidasDoMedico(String medicoId) {
        return (int) notificacoes.porMedico(medicoId).stream().filter(n -> !n.lida()).count();
    }
}
