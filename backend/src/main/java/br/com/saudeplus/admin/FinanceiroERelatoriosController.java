package br.com.saudeplus.admin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import br.com.saudeplus.admin.AgendamentosAdminService.Filtro;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.comum.Exportacao;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.financeiro.FinanceiroService;
import br.com.saudeplus.financeiro.FinanceiroService.Lancar;
import br.com.saudeplus.financeiro.FinanceiroService.Resumo;
import br.com.saudeplus.financeiro.FinanceiroService.TransacaoResposta;
import br.com.saudeplus.financeiro.FormaPagamento;
import br.com.saudeplus.financeiro.FormasDePagamentoService;
import br.com.saudeplus.financeiro.FormasDePagamentoService.FormaResposta;
import br.com.saudeplus.financeiro.StatusTransacao;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Módulos "financeiro" (`/api/admin/financeiro`) e "relatorios"
 * (`/api/admin/relatorios`). A exportação financeira fica no módulo
 * financeiro, para quem só vê relatórios não baixar dados de pagamento.
 */
@RestController
@RequestMapping("/api/admin")
public class FinanceiroERelatoriosController {

    private final FinanceiroService financeiro;
    private final FormasDePagamentoService formas;
    private final RelatoriosService relatorios;

    public FinanceiroERelatoriosController(FinanceiroService financeiro, FormasDePagamentoService formas,
            RelatoriosService relatorios) {
        this.financeiro = financeiro;
        this.formas = formas;
        this.relatorios = relatorios;
    }

    // ---------------------------------------------------------------- financeiro

    @GetMapping("/financeiro/transacoes")
    public Pagina<TransacaoResposta> transacoes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(required = false) String status, @RequestParam(required = false) String forma,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "50") int tamanho) {
        return financeiro.listar(new FinanceiroService.Filtro(de, ate, StatusTransacao.porChave(status),
                FormaPagamento.porChave(forma), q), pagina, tamanho);
    }

    /** Números do período (padrão: últimos 7 dias). */
    @GetMapping("/financeiro/resumo")
    public Resumo resumoFinanceiro(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return financeiro.resumo(de, ate);
    }

    /** Lançamento manual. `jaPago: true` exige a `forma`; ausente, a cobrança fica pendente. */
    public record LancarTransacao(
            @NotNull(message = "Informe o paciente") UUID pacienteId,
            UUID agendamentoId,
            @NotBlank(message = "Descreva a cobrança") @Size(max = 200, message = "Até 200 caracteres") String descricao,
            @NotNull(message = "Informe o valor") @DecimalMin(value = "0", message = "O valor não pode ser negativo") BigDecimal valor,
            FormaPagamento forma,
            // Boolean, e não boolean: o Jackson 3 recusa primitivo ausente no corpo.
            Boolean jaPago) {
    }

    @PostMapping("/financeiro/transacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public TransacaoResposta lancar(@Valid @RequestBody LancarTransacao dados) {
        return financeiro.lancar(new Lancar(dados.pacienteId(), dados.agendamentoId(), dados.descricao(), dados.valor(),
                dados.forma(), Boolean.TRUE.equals(dados.jaPago())));
    }

    /** `{ "status": "pago", "forma": "pix" }` dá baixa; `{ "status": "estornado" }` estorna ou anula. */
    public record AlterarStatusDaTransacao(@NotNull(message = "Informe o status") StatusTransacao status,
            FormaPagamento forma) {
    }

    @PatchMapping("/financeiro/transacoes/{id}/status")
    public TransacaoResposta alterarStatus(@PathVariable UUID id, @Valid @RequestBody AlterarStatusDaTransacao dados) {
        return financeiro.alterarStatus(id, dados.status(), dados.forma());
    }

    /** Todas as formas, com `ativa` indicando se a baixa aceita cada uma. */
    @GetMapping("/financeiro/formas-pagamento")
    public List<FormaResposta> formasDePagamento() {
        return formas.listar();
    }

    /** `{ "ativas": ["pix", "credito"] }`: as que ficarem de fora são desativadas. */
    public record DefinirFormas(@NotNull(message = "Informe as formas ativas") List<FormaPagamento> ativas) {
    }

    @PutMapping("/financeiro/formas-pagamento")
    public List<FormaResposta> definirFormasDePagamento(@Valid @RequestBody DefinirFormas dados) {
        return formas.definirAtivas(dados.ativas());
    }

    /** CSV (padrão, abre no Excel) ou PDF, dos lançamentos do período (padrão: últimos 30 dias). */
    @GetMapping("/financeiro/exportar")
    public ResponseEntity<byte[]> exportarFinanceiro(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(required = false) String status, @RequestParam(required = false) String formato) {
        return Exportacao.resposta(
                financeiro.tabela(new FinanceiroService.Filtro(de, ate, StatusTransacao.porChave(status), null, null)),
                Exportacao.Formato.porChave(formato));
    }

    // ---------------------------------------------------------------- relatórios

    /** Números, distribuições e evolução do período (padrão: últimos 30 dias). */
    @GetMapping("/relatorios/resumo")
    public RelatoriosService.Resumo resumo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(required = false) String status, @RequestParam(required = false) UUID unidadeId,
            @RequestParam(required = false) UUID medicoId, @RequestParam(required = false) UUID especialidadeId) {
        return relatorios.resumo(new Filtro(de, ate, StatusAgendamento.porChave(status), unidadeId, medicoId,
                especialidadeId, null));
    }

    /** `tipo`: agendamentos, atendimentos, cancelamentos ou pacientes; `formato`: csv (padrão), excel ou pdf. */
    @GetMapping("/relatorios/exportar")
    public ResponseEntity<byte[]> exportar(@RequestParam String tipo,
            @RequestParam(required = false) String formato,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(required = false) String status, @RequestParam(required = false) UUID unidadeId,
            @RequestParam(required = false) UUID medicoId, @RequestParam(required = false) UUID especialidadeId) {
        if (!RelatoriosService.TIPOS.contains(tipo)) {
            throw new RecursoNaoEncontradoException("Relatório desconhecido: " + tipo);
        }
        Exportacao.Formato comoSair = Exportacao.Formato.porChave(formato);
        return Exportacao.resposta(relatorios.tabela(tipo, new Filtro(de, ate, StatusAgendamento.porChave(status),
                unidadeId, medicoId, especialidadeId, null)), comoSair);
    }
}
