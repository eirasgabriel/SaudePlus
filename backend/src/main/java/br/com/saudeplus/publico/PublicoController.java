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
import br.com.saudeplus.publico.dto.BuscaPopularResposta;
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
    private final BuscasPopularesService buscasPopulares;
    private final ProfissionaisEmDestaqueService emDestaque;

    public PublicoController(CatalogoPublicoService catalogo, ProfissionaisPublicoService profissionais,
            BuscasPopularesService buscasPopulares, ProfissionaisEmDestaqueService emDestaque) {
        this.catalogo = catalogo;
        this.profissionais = profissionais;
        this.buscasPopulares = buscasPopulares;
        this.emDestaque = emDestaque;
    }

    /**
     * Profissionais em destaque: os perfis mais abertos nos últimos 30 dias,
     * no formato do cartão da busca. Lista vazia enquanto ninguém tiver aberto.
     */
    @GetMapping("/destaques")
    public List<ProfissionalResumoResposta> destaques(@RequestParam(defaultValue = "4") int limite) {
        return emDestaque.destaques(limite);
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
        Pagina<ProfissionalResumoResposta> resultado =
                profissionais.buscar(filtro, OrdemDaBusca.porChave(ordem), pagina, tamanho);
        // Só a primeira página conta: paginar a mesma busca não é buscar de novo.
        if (pagina <= 0) {
            buscasPopulares.registrar(especialidades);
        }
        return resultado;
    }

    /**
     * Top 10 (ou `limite`) das especialidades mais buscadas nos últimos 30 dias
     * (`[{ slug, nome }]`). Lista vazia enquanto ninguém tiver buscado.
     */
    @GetMapping("/buscas-populares")
    public List<BuscaPopularResposta> buscasPopulares(@RequestParam(defaultValue = "8") int limite) {
        return buscasPopulares.maisBuscadas(limite);
    }

    @GetMapping("/profissionais/{id}")
    public ProfissionalDetalheResposta profissional(@PathVariable UUID id) {
        ProfissionalDetalheResposta perfil = profissionais.detalhe(id);
        // Só conta perfil que existe e está ativo (detalhe lança 404 antes).
        emDestaque.registrarVisualizacao(id);
        return perfil;
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
