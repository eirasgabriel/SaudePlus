package br.com.saudeplus.areapaciente;

import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.areapaciente.dto.ConsultaDoPacienteResposta;
import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.Avaliar;
import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.Cancelar;
import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.Remarcar;
import br.com.saudeplus.areapaciente.dto.RequisicoesDoPaciente.Reservar;
import br.com.saudeplus.areapaciente.dto.RespostasDoPaciente;
import br.com.saudeplus.comum.Downloads;
import br.com.saudeplus.exames.StatusExame;
import br.com.saudeplus.financeiro.FinanceiroService;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.security.UsuarioAutenticado;
import jakarta.validation.Valid;

/**
 * Área do paciente. Exige papel PACIENTE (ver `SecurityConfig`); o paciente
 * vem do token. Consulta ou exame de outra pessoa responde 404.
 */
@RestController
@RequestMapping("/api/paciente")
public class AreaPacienteController {

    private final ConsultasDoPacienteService consultas;
    private final ExamesDoPacienteService exames;
    private final NotificacaoService notificacoes;
    private final FinanceiroService financeiro;

    public AreaPacienteController(ConsultasDoPacienteService consultas, ExamesDoPacienteService exames,
            NotificacaoService notificacoes, FinanceiroService financeiro) {
        this.consultas = consultas;
        this.exames = exames;
        this.notificacoes = notificacoes;
        this.financeiro = financeiro;
    }

    @GetMapping("/painel")
    public RespostasDoPaciente.Painel painel(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return consultas.painel(usuario);
    }

    /** `situacao`: `futuras` ou `passadas` (sem ela, todas); `status`: uma chave de status. */
    @GetMapping("/agendamentos")
    public List<ConsultaDoPacienteResposta> agendamentos(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(required = false) String situacao, @RequestParam(required = false) String status) {
        return consultas.listar(usuario, situacao, StatusAgendamento.porChave(status));
    }

    @PostMapping("/agendamentos")
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultaDoPacienteResposta reservar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody Reservar requisicao) {
        return consultas.reservar(usuario, requisicao);
    }

    @PatchMapping("/agendamentos/{id}/cancelar")
    public ConsultaDoPacienteResposta cancelar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id, @Valid @RequestBody(required = false) Cancelar requisicao) {
        return consultas.cancelar(usuario, id, requisicao == null ? null : requisicao.motivo());
    }

    @PatchMapping("/agendamentos/{id}/remarcar")
    public ConsultaDoPacienteResposta remarcar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id, @Valid @RequestBody Remarcar requisicao) {
        return consultas.remarcar(usuario, id, requisicao);
    }

    @GetMapping("/historico")
    public List<RespostasDoPaciente.Atendimento> historico(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return consultas.historico(usuario);
    }

    @PostMapping("/avaliacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public RespostasDoPaciente.AvaliacaoRegistrada avaliar(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody Avaliar requisicao) {
        return consultas.avaliar(usuario, requisicao);
    }

    @GetMapping("/exames")
    public List<RespostasDoPaciente.Exame> exames(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(required = false) String status) {
        return exames.listar(usuario, StatusExame.porChave(status));
    }

    @GetMapping("/exames/{id}")
    public RespostasDoPaciente.Exame exame(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable UUID id) {
        return exames.detalhe(usuario, id);
    }

    /** Arquivo do resultado, quando liberado; antes disso (ou de outra pessoa), 404. */
    @GetMapping("/exames/{id}/resultado")
    public ResponseEntity<Resource> resultado(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable UUID id) {
        return Downloads.anexo(exames.resultado(usuario, id));
    }

    /** Cobranças e pagamentos do paciente, mais recentes primeiro. */
    @GetMapping("/pagamentos")
    public List<FinanceiroService.TransacaoResposta> pagamentos(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return financeiro.doPaciente(consultas.pacienteDe(usuario));
    }

    @GetMapping("/notificacoes")
    public List<NotificacaoResposta> notificacoes(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return notificacoes.doUsuario(usuario.id());
    }

    @PatchMapping("/notificacoes/{id}/lida")
    public NotificacaoResposta marcarComoLida(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id) {
        return notificacoes.marcarComoLida(usuario.id(), id);
    }

    @PatchMapping("/notificacoes/lidas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marcarTodasComoLidas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        notificacoes.marcarTodasComoLidas(usuario.id());
    }
}
