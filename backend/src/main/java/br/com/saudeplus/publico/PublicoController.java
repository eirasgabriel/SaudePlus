package br.com.saudeplus.publico;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.profissionais.FiltroDeProfissionais;
import br.com.saudeplus.publico.dto.AvaliacaoPublicaResposta;
import br.com.saudeplus.publico.dto.CidadeResposta;
import br.com.saudeplus.publico.dto.ConvenioResposta;
import br.com.saudeplus.publico.dto.EspecialidadeResposta;
import br.com.saudeplus.publico.dto.HorarioLivreResposta;
import br.com.saudeplus.publico.dto.ProfissionalDetalheResposta;
import br.com.saudeplus.publico.dto.ProfissionalResumoResposta;
import br.com.saudeplus.publico.dto.TipoExameResposta;
import br.com.saudeplus.publico.dto.UnidadePublicaResposta;

/**
 * Rotas sem login, usadas pela busca e pelas páginas públicas do site.
 * Filtros de lista aceitam o parâmetro repetido: `?especialidade=a&especialidade=b`.
 */
@RestController
@RequestMapping("/api/publico")
public class PublicoController {

    private final CatalogoPublicoService catalogo;
    private final ProfissionaisPublicoService profissionais;

    public PublicoController(CatalogoPublicoService catalogo, ProfissionaisPublicoService profissionais) {
        this.catalogo = catalogo;
        this.profissionais = profissionais;
    }

    @GetMapping("/especialidades")
    public List<EspecialidadeResposta> especialidades() {
        return catalogo.especialidades();
    }

    @GetMapping("/convenios")
    public List<ConvenioResposta> convenios() {
        return catalogo.convenios();
    }

    @GetMapping("/tipos-exame")
    public List<TipoExameResposta> tiposDeExame() {
        return catalogo.tiposDeExame();
    }

    @GetMapping("/cidades")
    public List<CidadeResposta> cidades() {
        return catalogo.cidades();
    }

    @GetMapping("/unidades")
    public List<UnidadePublicaResposta> unidades(@RequestParam(required = false) String cidade,
            @RequestParam(required = false) String uf) {
        return catalogo.unidades(cidade, uf);
    }

    @GetMapping("/unidades/{id}")
    public UnidadePublicaResposta unidade(@PathVariable UUID id) {
        return catalogo.unidade(id);
    }

    @GetMapping("/profissionais")
    public Pagina<ProfissionalResumoResposta> buscarProfissionais(
            @RequestParam(required = false) String q,
            @RequestParam(name = "especialidade", required = false) List<String> especialidades,
            @RequestParam(required = false) String cidade,
            @RequestParam(required = false) String uf,
            @RequestParam(name = "modalidade", required = false) List<String> modalidades,
            @RequestParam(name = "convenio", required = false) List<String> convenios,
            @RequestParam(required = false) String ordem,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamanho) {
        List<Modalidade> modalidadesEscolhidas = modalidades == null
                ? List.of()
                : modalidades.stream().map(Modalidade::porChave).toList();
        FiltroDeProfissionais filtro = new FiltroDeProfissionais(
                q, especialidades, cidade, uf, modalidadesEscolhidas, convenios);
        return profissionais.buscar(filtro, OrdemDaBusca.porChave(ordem), pagina, tamanho);
    }

    @GetMapping("/profissionais/{id}")
    public ProfissionalDetalheResposta profissional(@PathVariable UUID id) {
        return profissionais.detalhe(id);
    }

    @GetMapping("/profissionais/{id}/avaliacoes")
    public Pagina<AvaliacaoPublicaResposta> avaliacoes(@PathVariable UUID id,
            @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "10") int tamanho) {
        return profissionais.avaliacoes(id, pagina, tamanho);
    }

    /**
     * Horários livres para reserva, por dia. Sem datas, as próximas duas
     * semanas; datas passadas viram hoje e o fim é limitado à janela de agenda.
     */
    @GetMapping("/profissionais/{id}/horarios")
    public List<HorarioLivreResposta> horarios(@PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return profissionais.horarios(id, de, ate);
    }
}
