package br.com.saudeplus.notificacoes;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.configuracoes.ConfiguracoesService;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.usuarios.Usuario;
import tools.jackson.databind.JsonNode;

/** Caixa de notificações de cada usuário. */
@Service
public class NotificacaoService {

    /** Quantas notificações a lista devolve; as mais antigas ficam de fora. */
    static final int LIMITE = 30;

    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("dd/MM");

    private final NotificacaoRepository notificacoes;
    private final Clock relogio;
    private final ConfiguracoesService configuracoes;

    public NotificacaoService(NotificacaoRepository notificacoes, Clock relogio, ConfiguracoesService configuracoes) {
        this.notificacoes = notificacoes;
        this.relogio = relogio;
        this.configuracoes = configuracoes;
    }

    /**
     * Grava na caixa do usuário, a não ser que a administração tenha desligado
     * as notificações no sistema ou esse tipo (Configurações > Notificações).
     */
    @Transactional
    public void notificar(Usuario usuario, TipoNotificacao tipo, String titulo, String detalhe) {
        if (!habilitada(tipo)) {
            return;
        }
        notificacoes.save(new Notificacao(usuario, tipo, titulo, detalhe, relogio.instant()));
    }

    /** Tipo da tela de Configurações que cobre cada tipo de notificação. */
    private static String tipoNaConfiguracao(TipoNotificacao tipo) {
        return switch (tipo) {
            case AGENDAMENTO, CANCELAMENTO, RETORNO -> "agendamentos";
            case RESULTADO -> "exames";
            case SISTEMA -> "mensagens";
        };
    }

    /** Sem nada gravado, tudo fica ligado. */
    private boolean habilitada(TipoNotificacao tipo) {
        JsonNode grupo = configuracoes.grupo("notificacoes");
        return ligado(grupo.path("canais").get("sistema")) && ligado(grupo.path("tipos").get(tipoNaConfiguracao(tipo)));
    }

    private static boolean ligado(JsonNode valor) {
        return valor == null || !valor.isBoolean() || valor.asBoolean();
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResposta> doUsuario(UUID usuarioId) {
        return notificacoes.findByUsuarioIdOrderByCriadaEmDesc(usuarioId, PageRequest.of(0, LIMITE)).stream()
                .map(n -> NotificacaoResposta.de(n, quando(n)))
                .toList();
    }

    @Transactional(readOnly = true)
    public long naoLidas(UUID usuarioId) {
        return notificacoes.countByUsuarioIdAndLidaFalse(usuarioId);
    }

    /** Notificação de outro usuário dá 404, como se não existisse. */
    @Transactional
    public NotificacaoResposta marcarComoLida(UUID usuarioId, UUID notificacaoId) {
        Notificacao notificacao = notificacoes.findByIdAndUsuarioId(notificacaoId, usuarioId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Notificação", notificacaoId.toString()));
        notificacao.marcarComoLida();
        return NotificacaoResposta.de(notificacao, quando(notificacao));
    }

    @Transactional
    public int marcarTodasComoLidas(UUID usuarioId) {
        return notificacoes.marcarTodasComoLidas(usuarioId);
    }

    /** "Hoje, 09:15", "Ontem, 17:20" ou "12/09, 08:00", no fuso de negócio. */
    private String quando(Notificacao notificacao) {
        LocalDateTime momento = LocalDateTime.ofInstant(notificacao.getCriadaEm(), relogio.getZone());
        LocalDate hoje = LocalDate.now(relogio);
        String dia;
        if (momento.toLocalDate().equals(hoje)) {
            dia = "Hoje";
        } else if (momento.toLocalDate().equals(hoje.minusDays(1))) {
            dia = "Ontem";
        } else {
            dia = momento.format(DIA);
        }
        return dia + ", " + momento.format(HORA);
    }
}
