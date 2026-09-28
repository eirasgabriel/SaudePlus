package br.com.saudeplus.notificacoes;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;

@RestController
public class NotificacaoController {

    private final NotificacaoService notificacoes;

    public NotificacaoController(NotificacaoService notificacoes) {
        this.notificacoes = notificacoes;
    }

    @GetMapping("/api/medicos/{medicoId}/notificacoes")
    public List<NotificacaoResposta> doMedico(@PathVariable String medicoId) {
        return notificacoes.doMedico(medicoId);
    }
}
