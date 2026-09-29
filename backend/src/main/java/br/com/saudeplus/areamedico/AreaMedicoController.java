package br.com.saudeplus.areamedico;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.areamedico.dto.AgendaConfiguradaResposta.BloqueioResposta;
import br.com.saudeplus.areamedico.dto.AgendaConfiguradaResposta.DisponibilidadeResposta;
import br.com.saudeplus.areamedico.dto.ConsultaResposta;
import br.com.saudeplus.areamedico.dto.ExamePendenteResposta;
import br.com.saudeplus.areamedico.dto.PacienteDetalheResposta;
import br.com.saudeplus.areamedico.dto.PacienteResumoResposta;
import br.com.saudeplus.areamedico.dto.PainelMedicoResposta;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.AtualizarStatus;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.CriarBloqueio;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.RegistrarAtendimento;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.SalvarDisponibilidade;
import br.com.saudeplus.areamedico.dto.RequisicoesDoMedico.SolicitarExame;
import br.com.saudeplus.comum.Downloads;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.security.UsuarioAutenticado;
import jakarta.validation.Valid;

/**
 * Área do médico. Exige papel MEDICO (ver `SecurityConfig`); o médico vem do
 * token, então nenhuma rota recebe o id dele. Recursos de outro médico
 * respondem 404. Chamado por `frontend/src/features/medico/medico.api.js`.
 */
@RestController
@RequestMapping("/api/medico")
public class AreaMedicoController {

    private final PainelMedicoService painel;
    private final AgendaDoMedicoService agenda;
    private final PacientesDoMedicoService pacientes;
    private final ConfiguracaoDeAgendaService configuracao;
    private final NotificacaoService notificacoes;
    private final ExamesDoMedicoService exames;

    public AreaMedicoController(PainelMedicoService painel, AgendaDoMedicoService agenda,
            PacientesDoMedicoService pacientes, ConfiguracaoDeAgendaService configuracao,
            NotificacaoService notificacoes, ExamesDoMedicoService exames) {
        this.painel = painel;
        this.agenda = agenda;
        this.pacientes = pacientes;
        this.configuracao = configuracao;
        this.notificacoes = notificacoes;
        this.exames = exames;
    }

    /** Tela inicial. Sem `data`, usa o dia de hoje. */
    @GetMapping("/painel")
    public PainelMedicoResposta painel(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return painel.montar(usuario, data);
    }

    /** Agenda de um dia; `status` aceita a chave de um status, ou "todas". */
    @GetMapping("/agenda")
    public List<ConsultaResposta> agenda(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) String status) {
        StatusAgendamento filtro = status == null || status.isBlank() || "todas".equalsIgnoreCase(status)
                ? null
                : StatusAgendamento.porChave(status);
        return agenda.agendaDoDia(usuario, data, filtro);
    }

    @PatchMapping("/agendamentos/{id}/status")
    public ConsultaResposta mudarStatus(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable UUID id,
            @Valid @RequestBody AtualizarStatus requisicao) {
        return agenda.mudarStatus(usuario, id, requisicao);
    }

    /** Registra resumo e desfecho; encerra a consulta em andamento como realizada. */
    @PatchMapping("/agendamentos/{id}/atendimento")
    public ConsultaResposta registrarAtendimento(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id, @Valid @RequestBody RegistrarAtendimento requisicao) {
        return agenda.registrarAtendimento(usuario, id, requisicao);
    }

    @GetMapping("/pacientes")
    public Pagina<PacienteResumoResposta> pacientes(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {
        return pacientes.listar(usuario, q, pagina, tamanho);
    }

    @GetMapping("/pacientes/{id}")
    public PacienteDetalheResposta paciente(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id) {
        return pacientes.detalhe(usuario, id);
    }

    @GetMapping("/exames-pendentes")
    public List<ExamePendenteResposta> examesPendentes(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return exames.pendentes(usuario);
    }

    /** Pede um exame para um paciente seu (com consulta com você); os demais dão 404. */
    @PostMapping("/exames")
    @ResponseStatus(HttpStatus.CREATED)
    public ExamePendenteResposta solicitarExame(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody SolicitarExame requisicao) {
        return exames.solicitar(usuario, requisicao);
    }

    /** Arquivo do resultado de um exame que você pediu. */
    @GetMapping("/exames/{id}/resultado")
    public ResponseEntity<Resource> resultado(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id) {
        return Downloads.anexo(exames.resultado(usuario, id));
    }

    // ------------------------------------------------------------ disponibilidades

    @GetMapping("/disponibilidades")
    public List<DisponibilidadeResposta> disponibilidades(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return configuracao.disponibilidades(usuario);
    }

    @PostMapping("/disponibilidades")
    @ResponseStatus(HttpStatus.CREATED)
    public DisponibilidadeResposta criarDisponibilidade(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody SalvarDisponibilidade requisicao) {
        return configuracao.criarDisponibilidade(usuario, requisicao);
    }

    @PutMapping("/disponibilidades/{id}")
    public DisponibilidadeResposta alterarDisponibilidade(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id, @Valid @RequestBody SalvarDisponibilidade requisicao) {
        return configuracao.alterarDisponibilidade(usuario, id, requisicao);
    }

    @DeleteMapping("/disponibilidades/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerDisponibilidade(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable UUID id) {
        configuracao.removerDisponibilidade(usuario, id);
    }

    // ------------------------------------------------------------------- bloqueios

    @GetMapping("/bloqueios")
    public List<BloqueioResposta> bloqueios(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return configuracao.bloqueiosFuturos(usuario);
    }

    /** Com consultas marcadas no período, só bloqueia com `?cancelarAgendamentos=true`. */
    @PostMapping("/bloqueios")
    @ResponseStatus(HttpStatus.CREATED)
    public BloqueioResposta bloquear(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @Valid @RequestBody CriarBloqueio requisicao,
            @RequestParam(defaultValue = "false") boolean cancelarAgendamentos) {
        return configuracao.bloquear(usuario, requisicao, cancelarAgendamentos);
    }

    @DeleteMapping("/bloqueios/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desbloquear(@AuthenticationPrincipal UsuarioAutenticado usuario, @PathVariable UUID id) {
        configuracao.desbloquear(usuario, id);
    }

    // --------------------------------------------------------------- notificações

    @GetMapping("/notificacoes")
    public List<NotificacaoResposta> notificacoes(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return notificacoes.doUsuario(usuario.id());
    }

    @PatchMapping("/notificacoes/{id}/lida")
    public NotificacaoResposta marcarComoLida(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @PathVariable UUID id) {
        return notificacoes.marcarComoLida(usuario.id(), id);
    }
}
