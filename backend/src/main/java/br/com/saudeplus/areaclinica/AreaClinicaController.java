package br.com.saudeplus.areaclinica;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
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

import br.com.saudeplus.admin.CadastrosAdminService;
import br.com.saudeplus.admin.AgendamentosAdminService;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.UnidadeAdmin;
import br.com.saudeplus.admin.dto.AgendamentoAdminResposta;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.AlterarStatusDoAgendamento;
import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.areaclinica.MedicosDaClinicaService.MedicoDaUnidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exception.AcessoProibidoException;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.notificacoes.NotificacaoService;
import br.com.saudeplus.notificacoes.dto.NotificacaoResposta;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.UsuarioRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** O escopo sempre vem da conta autenticada, nunca de um id enviado pelo cliente. */
@RestController
@RequestMapping("/api/clinica")
@Transactional(readOnly = true)
public class AreaClinicaController {
    private final UsuarioRepository usuarios;
    private final CadastrosAdminService cadastros;
    private final AgendamentosAdminService agendamentos;
    private final MedicosDaClinicaService medicos;
    private final Clock relogio;
    private final AgendamentoRepository agendamentosDaUnidade;
    private final NotificacaoService notificacoes;

    public AreaClinicaController(UsuarioRepository usuarios, CadastrosAdminService cadastros,
            AgendamentosAdminService agendamentos, MedicosDaClinicaService medicos, Clock relogio,
            AgendamentoRepository agendamentosDaUnidade, NotificacaoService notificacoes) {
        this.usuarios = usuarios;
        this.cadastros = cadastros;
        this.agendamentos = agendamentos;
        this.medicos = medicos;
        this.relogio = relogio;
        this.agendamentosDaUnidade = agendamentosDaUnidade;
        this.notificacoes = notificacoes;
    }

    public record Vinculo(@NotNull(message = "Escolha um médico.") UUID medicoId) { }

    public record Painel(List<UnidadeAdmin> unidades, List<String> modulos) { }

    @GetMapping("/painel")
    public Painel painel(@AuthenticationPrincipal UsuarioAutenticado ator) {
        Unidade unidade = unidade(ator);
        return new Painel(List.of(cadastros.buscarUnidade(unidade.getId())), List.of("clinicas", "agendamentos"));
    }

    @GetMapping("/agendamentos")
    public Pagina<AgendamentoAdminResposta> agenda(@AuthenticationPrincipal UsuarioAutenticado ator,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "500") int tamanho) {
        Unidade unidade = unidade(ator);
        LocalDate inicio = de == null ? LocalDate.now(relogio) : de;
        return agendamentos.listar(new AgendamentosAdminService.Filtro(inicio, ate == null ? inicio : ate,
                null, unidade.getId(), null, null, null), pagina, tamanho);
    }

    @GetMapping("/medicos")
    public List<MedicoDaUnidade> medicos(@AuthenticationPrincipal UsuarioAutenticado ator) {
        return medicos.vinculados(unidade(ator));
    }

    @GetMapping("/medicos/disponiveis")
    public List<MedicoDaUnidade> medicosDisponiveis(@AuthenticationPrincipal UsuarioAutenticado ator,
            @RequestParam(name = "busca", required = false) String busca) {
        return medicos.buscar(unidade(ator), busca);
    }

    @PostMapping("/medicos")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public MedicoDaUnidade vincular(@AuthenticationPrincipal UsuarioAutenticado ator, @Valid @RequestBody Vinculo vinculo) {
        return medicos.vincular(unidade(ator), vinculo.medicoId());
    }

    @DeleteMapping("/medicos/{medicoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void desvincular(@AuthenticationPrincipal UsuarioAutenticado ator, @PathVariable UUID medicoId) {
        medicos.desvincular(unidade(ator), medicoId);
    }

    /** O que a recepção da clínica faz na agenda: confirmar, registrar chegada e cancelar. */
    private static final Set<StatusAgendamento> STATUS_DA_RECEPCAO =
            Set.of(StatusAgendamento.CONFIRMADA, StatusAgendamento.AGUARDANDO, StatusAgendamento.CANCELADA);

    /** Só agendamentos da própria unidade; os de outra respondem 404, como se não existissem. */
    @PatchMapping("/agendamentos/{id}/status")
    @Transactional
    public AgendamentoAdminResposta alterarStatus(@AuthenticationPrincipal UsuarioAutenticado ator,
            @PathVariable UUID id, @Valid @RequestBody AlterarStatusDoAgendamento requisicao) {
        Unidade unidade = unidade(ator);
        agendamentosDaUnidade.findCompletoById(id)
                .filter(a -> a.getUnidade().getId().equals(unidade.getId()))
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Agendamento", id.toString()));
        if (!STATUS_DA_RECEPCAO.contains(requisicao.status())) {
            throw new RegraDeNegocioException("A clínica pode confirmar, registrar a chegada ou cancelar a consulta.");
        }
        return agendamentos.alterarStatus(ator, id, requisicao);
    }

    /** Contato que a clínica mantém: telefone, horário de funcionamento e e-mail. */
    public record DadosDeContato(
            @Size(max = 20, message = "Até 20 caracteres") String telefone,
            @Size(max = 200, message = "Até 200 caracteres") String horarioFuncionamento,
            @Email(message = "Informe um e-mail válido") @Size(max = 180, message = "Até 180 caracteres") String email) {
    }

    @PutMapping("/unidade")
    @Transactional
    public UnidadeAdmin alterarContato(@AuthenticationPrincipal UsuarioAutenticado ator,
            @Valid @RequestBody DadosDeContato dados) {
        return cadastros.alterarContatoDaUnidade(unidade(ator).getId(), dados.telefone(),
                dados.horarioFuncionamento(), dados.email());
    }

    // ------------------------------------------------------------ notificações

    @GetMapping("/notificacoes")
    public List<NotificacaoResposta> notificacoes(@AuthenticationPrincipal UsuarioAutenticado ator) {
        return notificacoes.doUsuario(ator.id());
    }

    @PatchMapping("/notificacoes/{id}/lida")
    @Transactional
    public NotificacaoResposta marcarComoLida(@AuthenticationPrincipal UsuarioAutenticado ator, @PathVariable UUID id) {
        return notificacoes.marcarComoLida(ator.id(), id);
    }

    @PatchMapping("/notificacoes/lidas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void marcarTodasComoLidas(@AuthenticationPrincipal UsuarioAutenticado ator) {
        notificacoes.marcarTodasComoLidas(ator.id());
    }

    private Unidade unidade(UsuarioAutenticado ator) {
        Unidade unidade = usuarios.findById(ator.id()).orElseThrow(() -> new AcessoProibidoException("Conta não encontrada."))
                .getUnidade();
        if (unidade == null || !unidade.ativa()) throw new AcessoProibidoException("Unidade sem acesso ativo.");
        return unidade;
    }
}
