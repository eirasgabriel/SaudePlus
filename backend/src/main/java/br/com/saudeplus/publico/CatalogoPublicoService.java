package br.com.saudeplus.publico;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.clinicas.StatusUnidade;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.exames.TipoExameRepository;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.profissionais.ConvenioRepository;
import br.com.saudeplus.profissionais.EspecialidadeRepository;
import br.com.saudeplus.publico.dto.CidadeResposta;
import br.com.saudeplus.publico.dto.ConvenioResposta;
import br.com.saudeplus.publico.dto.EspecialidadeResposta;
import br.com.saudeplus.publico.dto.TipoExameResposta;
import br.com.saudeplus.publico.dto.UnidadePublicaResposta;

/** Listas de apoio da busca: especialidades, convênios, cidades e unidades. */
@Service
public class CatalogoPublicoService {

    private final EspecialidadeRepository especialidades;
    private final ConvenioRepository convenios;
    private final UnidadeRepository unidades;
    private final TipoExameRepository tiposDeExame;

    public CatalogoPublicoService(EspecialidadeRepository especialidades, ConvenioRepository convenios,
            UnidadeRepository unidades, TipoExameRepository tiposDeExame) {
        this.especialidades = especialidades;
        this.convenios = convenios;
        this.unidades = unidades;
        this.tiposDeExame = tiposDeExame;
    }

    @Transactional(readOnly = true)
    public List<EspecialidadeResposta> especialidades() {
        return especialidades.findAllByOrderByNome().stream().map(EspecialidadeResposta::de).toList();
    }

    @Transactional(readOnly = true)
    public List<ConvenioResposta> convenios() {
        return convenios.findByAtivoTrueOrderByNome().stream().map(ConvenioResposta::de).toList();
    }

    @Transactional(readOnly = true)
    public List<TipoExameResposta> tiposDeExame() {
        return tiposDeExame.findAll(Sort.by("categoria", "nome")).stream().map(TipoExameResposta::de).toList();
    }

    @Transactional(readOnly = true)
    public List<CidadeResposta> cidades() {
        return unidades.cidadesAtendidas().stream().map(CidadeResposta::de).toList();
    }

    /** Unidades em funcionamento; com cidade e UF, só as daquela cidade. */
    @Transactional(readOnly = true)
    public List<UnidadePublicaResposta> unidades(String cidade, String uf) {
        List<Unidade> lista = cidade != null && uf != null
                ? unidades.findByStatusAndCidadeIgnoreCaseAndUfIgnoreCaseOrderByNome(StatusUnidade.ATIVA, cidade, uf)
                : unidades.findByStatusOrderByNome(StatusUnidade.ATIVA);
        return lista.stream().map(UnidadePublicaResposta::de).toList();
    }

    @Transactional(readOnly = true)
    public UnidadePublicaResposta unidade(UUID id) {
        return unidades.findById(id)
                .filter(Unidade::ativa)
                .map(UnidadePublicaResposta::de)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Unidade", id.toString()));
    }
}
