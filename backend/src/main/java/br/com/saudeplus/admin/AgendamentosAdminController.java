package br.com.saudeplus.admin;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.admin.AgendamentosAdminService.Calendario;
import br.com.saudeplus.admin.AgendamentosAdminService.Filtro;
import br.com.saudeplus.admin.AgendamentosAdminService.Metricas;
import br.com.saudeplus.admin.dto.AgendamentoAdminResposta;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.AlterarStatusDoAgendamento;
import br.com.saudeplus.agendamentos.StatusAgendamento;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.security.UsuarioAutenticado;
import jakarta.validation.Valid;

/** Módulo "agendamentos" da administração. */
@RestController
@RequestMapping("/api/admin/agendamentos")
public class AgendamentosAdminController {

    private final AgendamentosAdminService agendamentos;

    public AgendamentosAdminController(AgendamentosAdminService agendamentos) {
        this.agendamentos = agendamentos;
    }

    @GetMapping
    public Pagina<AgendamentoAdminResposta> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID unidadeId,
            @RequestParam(required = false) UUID medicoId,
            @RequestParam(required = false) UUID especialidadeId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamanho) {
        return agendamentos.listar(new Filtro(de, ate, StatusAgendamento.porChave(status), unidadeId, medicoId,
                especialidadeId, q),
                pagina, tamanho);
    }

    /** Totais por status no período (padrão: mês corrente). */
    @GetMapping("/metricas")
    public Metricas metricas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return agendamentos.metricas(de, ate);
    }

    /** `mes` no formato `2026-09`; sem ele, o mês corrente. */
    @GetMapping("/calendario")
    public Calendario calendario(@RequestParam(required = false) YearMonth mes) {
        return agendamentos.calendario(mes);
    }

    @PatchMapping("/{id}/status")
    public AgendamentoAdminResposta alterarStatus(@AuthenticationPrincipal UsuarioAutenticado ator,
            @PathVariable UUID id, @Valid @RequestBody AlterarStatusDoAgendamento requisicao) {
        return agendamentos.alterarStatus(ator, id, requisicao);
    }
}
