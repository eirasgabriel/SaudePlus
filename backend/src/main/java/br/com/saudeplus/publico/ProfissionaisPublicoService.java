package br.com.saudeplus.publico;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.agenda.AgendaService;
import br.com.saudeplus.agenda.CalculadoraDeHorarios.HorarioLivre;
import br.com.saudeplus.agenda.DisponibilidadeRepository;
import br.com.saudeplus.agenda.Modalidade;
import br.com.saudeplus.agenda.ModalidadeDoMedico;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.profissionais.Convenio;
import br.com.saudeplus.profissionais.AvaliacaoRepository;
import br.com.saudeplus.profissionais.FiltroDeProfissionais;
import br.com.saudeplus.profissionais.Medico;
import br.com.saudeplus.profissionais.MedicoRepository;
import br.com.saudeplus.publico.dto.AvaliacaoPublicaResposta;
import br.com.saudeplus.publico.dto.HorarioLivreResposta;
import br.com.saudeplus.publico.dto.ProfissionalDetalheResposta;
import br.com.saudeplus.publico.dto.ProfissionalResumoResposta;
import br.com.saudeplus.publico.dto.ProfissionalResumoResposta.EspecialidadeResumo;
import br.com.saudeplus.publico.dto.UnidadePublicaResposta;

/** Busca e perfil público de médicos, sem login. */
@Service
public class ProfissionaisPublicoService {

    static final int TAMANHO_MAXIMO = 50;
    /** O cartão procura horários livres até duas semanas à frente e mostra no máximo seis. */
    private static final int DIAS_A_FRENTE = 14;
    private static final int HORARIOS_NO_CARTAO = 6;
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");

    private final MedicoRepository medicos;
    private final DisponibilidadeRepository disponibilidades;
    private final AgendaService agenda;
    private final AvaliacaoRepository avaliacoes;

    public ProfissionaisPublicoService(MedicoRepository medicos, DisponibilidadeRepository disponibilidades,
            AgendaService agenda, AvaliacaoRepository avaliacoes) {
        this.medicos = medicos;
        this.disponibilidades = disponibilidades;
        this.agenda = agenda;
        this.avaliacoes = avaliacoes;
    }

    @Transactional(readOnly = true)
    public Pagina<ProfissionalResumoResposta> buscar(FiltroDeProfissionais filtro, OrdemDaBusca ordem,
            int pagina, int tamanho) {
        PageRequest pedido = PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO), ordem.ordenacao());
        Page<Medico> encontrados = medicos.findAll(filtro.comoEspecificacao(), pedido);
        List<UUID> ids = encontrados.getContent().stream().map(Medico::getId).toList();
        Map<UUID, List<Modalidade>> modalidades = modalidadesPorMedico(ids);
        Map<UUID, List<HorarioLivre>> proximos = agenda.proximosHorarios(ids, DIAS_A_FRENTE, HORARIOS_NO_CARTAO);
        return Pagina.de(encontrados, medico -> resumo(medico, filtro,
                modalidades.getOrDefault(medico.getId(), List.of()),
                proximos.getOrDefault(medico.getId(), List.of())));
    }

    /** Avaliações do médico, mais recentes primeiro. */
    @Transactional(readOnly = true)
    public Pagina<AvaliacaoPublicaResposta> avaliacoes(UUID id, int pagina, int tamanho) {
        Medico medico = ativo(id);
        var encontradas = avaliacoes.findByMedicoIdOrderByCriadoEmDesc(medico.getId(),
                PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanho, 1, TAMANHO_MAXIMO)));
        return Pagina.de(encontradas, a -> new AvaliacaoPublicaResposta(a.getNota(), a.getComentario(),
                AvaliacaoPublicaResposta.abreviar(a.getPaciente().getUsuario().getNomeCompleto()),
                LocalDate.ofInstant(a.getCriadoEm(), agenda.fuso())));
    }

    /** Horários livres do médico entre `de` e `ate` (padrão: próximas duas semanas). */
    @Transactional(readOnly = true)
    public List<HorarioLivreResposta> horarios(UUID id, LocalDate de, LocalDate ate) {
        Medico medico = ativo(id);
        return agenda.horariosLivres(medico.getId(), de, ate).stream().map(HorarioLivreResposta::de).toList();
    }

    @Transactional(readOnly = true)
    public ProfissionalDetalheResposta detalhe(UUID id) {
        Medico medico = ativo(id);
        List<Modalidade> modalidades = modalidadesPorMedico(List.of(id)).getOrDefault(id, List.of());
        return new ProfissionalDetalheResposta(
                medico.getId(),
                medico.getUsuario().getNomeCompleto(),
                medico.getUsuario().getFotoUrl(),
                medico.getCrm(),
                medico.getCrmUf(),
                medico.getBio(),
                especialidades(medico),
                medico.getNotaMedia(),
                medico.getTotalAvaliacoes(),
                medico.unidadesAtivas().stream().map(UnidadePublicaResposta::de).toList(),
                modalidades,
                medico.conveniosOrdenados().stream().map(Convenio::getNome).toList(),
                medico.getValorConsulta());
    }

    private Medico ativo(UUID id) {
        return medicos.findComUsuarioById(id)
                .filter(encontrado -> encontrado.getUsuario().ativo())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Profissional", id.toString()));
    }

    private ProfissionalResumoResposta resumo(Medico medico, FiltroDeProfissionais filtro, List<Modalidade> modalidades,
            List<HorarioLivre> proximos) {
        return new ProfissionalResumoResposta(
                medico.getId(),
                medico.getUsuario().getNomeCompleto(),
                medico.getUsuario().getFotoUrl(),
                medico.getCrm(),
                medico.getCrmUf(),
                especialidades(medico),
                medico.getNotaMedia(),
                medico.getTotalAvaliacoes(),
                localDoCartao(medico, filtro),
                modalidades,
                medico.conveniosOrdenados().stream().map(Convenio::getNome).toList(),
                medico.getValorConsulta(),
                proximos.isEmpty() ? null : proximos.getFirst().data(),
                proximos.stream().map(livre -> livre.horario().format(HORA)).toList());
    }

    /** A unidade na cidade filtrada, se houver filtro; senão a primeira em funcionamento. */
    private static UnidadePublicaResposta localDoCartao(Medico medico, FiltroDeProfissionais filtro) {
        List<Unidade> ativas = medico.unidadesAtivas();
        return ativas.stream()
                .filter(unidade -> filtro.cidade() == null || unidade.getCidade().equalsIgnoreCase(filtro.cidade()))
                .filter(unidade -> filtro.uf() == null || unidade.getUf().equalsIgnoreCase(filtro.uf()))
                .findFirst()
                .or(() -> ativas.stream().findFirst())
                .map(UnidadePublicaResposta::de)
                .orElse(null);
    }

    private static List<EspecialidadeResumo> especialidades(Medico medico) {
        return medico.especialidadesOrdenadas().stream()
                .map(especialidade -> new EspecialidadeResumo(especialidade.getSlug(), especialidade.getNome()))
                .toList();
    }

    private Map<UUID, List<Modalidade>> modalidadesPorMedico(Collection<UUID> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return disponibilidades.modalidadesDos(ids).stream()
                .collect(Collectors.groupingBy(ModalidadeDoMedico::medicoId, Collectors.collectingAndThen(
                        Collectors.mapping(ModalidadeDoMedico::modalidade, Collectors.toCollection(ArrayList::new)),
                        lista -> lista.stream().sorted(Comparator.comparing(Enum::ordinal)).toList())));
    }
}
