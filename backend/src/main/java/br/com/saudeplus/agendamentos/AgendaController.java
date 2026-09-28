package br.com.saudeplus.agendamentos;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.agendamentos.dto.AtualizarStatusRequisicao;
import br.com.saudeplus.agendamentos.dto.ConsultaResposta;
import br.com.saudeplus.dados.DadosDemonstracao;
import jakarta.validation.Valid;

@RestController
@Validated
public class AgendaController {

    private final AgendaService agenda;

    public AgendaController(AgendaService agenda) {
        this.agenda = agenda;
    }

    /**
     * Agenda do dia de um profissional.
     *
     * `status` aceita as chaves do domínio (realizada, em_andamento,
     * aguardando, confirmada). Um valor desconhecido devolve 400, em vez de
     * silenciosamente ignorar o filtro e mostrar a agenda inteira.
     */
    @GetMapping("/api/medicos/{medicoId}/agenda")
    public List<ConsultaResposta> doDia(
            @PathVariable String medicoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) String status) {
        LocalDate dia = data != null ? data : DadosDemonstracao.DATA_REFERENCIA;
        StatusConsulta filtro = (status == null || status.isBlank() || "todas".equalsIgnoreCase(status))
                ? null
                : StatusConsulta.porChave(status);
        return agenda.agendaDoDia(medicoId, dia, filtro);
    }

    /** Move a consulta para outro status (confirmada -> aguardando -> ...). */
    @PatchMapping("/api/agendamentos/{consultaId}/status")
    public ConsultaResposta atualizarStatus(
            @PathVariable String consultaId,
            @Valid @RequestBody AtualizarStatusRequisicao requisicao) {
        return agenda.atualizarStatus(consultaId, requisicao.status());
    }
}
