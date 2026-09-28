package br.com.saudeplus.notificacoes;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.saudeplus.dados.DadosDemonstracao;

@Repository
public class NotificacaoEmMemoriaRepository implements NotificacaoRepository {

    private final List<Notificacao> notificacoes = DadosDemonstracao.notificacoes();

    @Override
    public List<Notificacao> porMedico(String medicoId) {
        return notificacoes.stream().filter(n -> n.medicoId().equals(medicoId)).toList();
    }
}
