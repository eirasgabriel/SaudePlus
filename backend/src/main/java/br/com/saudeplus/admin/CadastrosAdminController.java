package br.com.saudeplus.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.admin.dto.CadastrosAdminResposta.ConvenioAdmin;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.EspecialidadeAdmin;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.MetricasDeUnidades;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.TipoExameAdmin;
import br.com.saudeplus.admin.dto.CadastrosAdminResposta.UnidadeAdmin;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.AlterarStatusDaUnidade;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarConvenio;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarEspecialidade;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarTipoExame;
import br.com.saudeplus.admin.dto.RequisicoesAdmin.SalvarUnidade;
import jakarta.validation.Valid;

/** Módulo "clinicas" da administração: unidades e catálogos. */
@RestController
@RequestMapping("/api/admin")
public class CadastrosAdminController {

    private final CadastrosAdminService cadastros;

    public CadastrosAdminController(CadastrosAdminService cadastros) {
        this.cadastros = cadastros;
    }

    @GetMapping("/unidades")
    public List<UnidadeAdmin> unidades() {
        return cadastros.unidades();
    }

    @GetMapping("/unidades/metricas")
    public MetricasDeUnidades metricasDeUnidades() {
        return cadastros.metricasDeUnidades();
    }

    @PostMapping("/unidades")
    @ResponseStatus(HttpStatus.CREATED)
    public UnidadeAdmin criarUnidade(@Valid @RequestBody SalvarUnidade dados) {
        return cadastros.criarUnidade(dados);
    }

    @PutMapping("/unidades/{id}")
    public UnidadeAdmin alterarUnidade(@PathVariable UUID id, @Valid @RequestBody SalvarUnidade dados) {
        return cadastros.alterarUnidade(id, dados);
    }

    @PatchMapping("/unidades/{id}/status")
    public UnidadeAdmin alterarStatusDaUnidade(@PathVariable UUID id, @Valid @RequestBody AlterarStatusDaUnidade dados) {
        return cadastros.alterarStatusDaUnidade(id, dados.status());
    }

    /** Exclusão lógica: a unidade fica inativa e o histórico continua. */
    @DeleteMapping("/unidades/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluirUnidade(@PathVariable UUID id) {
        cadastros.excluirUnidade(id);
    }

    @GetMapping("/especialidades")
    public List<EspecialidadeAdmin> especialidades() {
        return cadastros.especialidades();
    }

    @PostMapping("/especialidades")
    @ResponseStatus(HttpStatus.CREATED)
    public EspecialidadeAdmin criarEspecialidade(@Valid @RequestBody SalvarEspecialidade dados) {
        return cadastros.criarEspecialidade(dados);
    }

    @PutMapping("/especialidades/{id}")
    public EspecialidadeAdmin alterarEspecialidade(@PathVariable UUID id, @Valid @RequestBody SalvarEspecialidade dados) {
        return cadastros.alterarEspecialidade(id, dados);
    }

    @GetMapping("/convenios")
    public List<ConvenioAdmin> convenios() {
        return cadastros.convenios();
    }

    @PostMapping("/convenios")
    @ResponseStatus(HttpStatus.CREATED)
    public ConvenioAdmin criarConvenio(@Valid @RequestBody SalvarConvenio dados) {
        return cadastros.criarConvenio(dados);
    }

    @PutMapping("/convenios/{id}")
    public ConvenioAdmin alterarConvenio(@PathVariable UUID id, @Valid @RequestBody SalvarConvenio dados) {
        return cadastros.alterarConvenio(id, dados);
    }

    @GetMapping("/tipos-exame")
    public List<TipoExameAdmin> tiposDeExame() {
        return cadastros.tiposDeExame();
    }

    @PostMapping("/tipos-exame")
    @ResponseStatus(HttpStatus.CREATED)
    public TipoExameAdmin criarTipoDeExame(@Valid @RequestBody SalvarTipoExame dados) {
        return cadastros.criarTipoDeExame(dados);
    }

    @PutMapping("/tipos-exame/{id}")
    public TipoExameAdmin alterarTipoDeExame(@PathVariable UUID id, @Valid @RequestBody SalvarTipoExame dados) {
        return cadastros.alterarTipoDeExame(id, dados);
    }
}
