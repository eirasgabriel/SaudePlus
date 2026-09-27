package br.com.saudeplus.notificacoes;

import java.util.List;

public interface NotificacaoRepository {

    List<Notificacao> porMedico(String medicoId);
}
