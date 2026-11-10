package br.com.saudeplus.admin;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.saudeplus.admin.dto.ExameDaClinicaResposta;
import br.com.saudeplus.exames.Exame;
import br.com.saudeplus.exames.ExameRepository;
import br.com.saudeplus.exames.ExamesService;
import br.com.saudeplus.exames.StatusExame;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * Operação de exames pela clínica (papel ADMIN): fila, coleta, análise e
 * resultado. O upload é `multipart/form-data` com o campo `arquivo`.
 */
@RestController
@RequestMapping("/api/admin/exames")
public class ExamesDaClinicaController {

    private final ExamesService exames;
    private final ExameRepository repositorio;
    private final Clock relogio;

    public ExamesDaClinicaController(ExamesService exames, ExameRepository repositorio, Clock relogio) {
        this.exames = exames;
        this.repositorio = repositorio;
        this.relogio = relogio;
    }

    /** Todos os exames (ou só de um status), pedidos mais antigos primeiro. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<ExameDaClinicaResposta> fila(@RequestParam(required = false) String status) {
        return repositorio.fila(StatusExame.porChave(status)).stream().map(this::resposta).toList();
    }

    /** Marca (ou muda) a coleta; o paciente é avisado. */
    @PatchMapping("/{id}/agendamento")
    public ExameDaClinicaResposta agendar(@PathVariable UUID id, @Valid @RequestBody AgendarColeta requisicao) {
        return resposta(exames.agendar(id, requisicao.dataHora(), requisicao.unidadeId()));
    }

    @PatchMapping("/{id}/em-analise")
    public ExameDaClinicaResposta iniciarAnalise(@PathVariable UUID id) {
        return resposta(exames.iniciarAnalise(id));
    }

    @PatchMapping("/{id}/cancelar")
    public ExameDaClinicaResposta cancelar(@PathVariable UUID id) {
        return resposta(exames.cancelar(id));
    }

    /** Anexa o resultado (PDF, PNG ou JPEG até 10 MB) e libera; paciente e médico são avisados. */
    @PostMapping(path = "/{id}/resultado", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ExameDaClinicaResposta liberarResultado(@PathVariable UUID id,
            @RequestPart(name = "arquivo", required = false) MultipartFile arquivo) {
        return resposta(exames.liberarResultado(id, arquivo));
    }

    /** `dataHora` é horário local da unidade: `2026-10-05T07:30`. */
    public record AgendarColeta(
            @NotNull(message = "Informe a data e a hora da coleta.") LocalDateTime dataHora,
            @NotNull(message = "Informe a unidade.") UUID unidadeId) {
    }

    private ExameDaClinicaResposta resposta(Exame exame) {
        return ExameDaClinicaResposta.de(exame, relogio.getZone());
    }
}
