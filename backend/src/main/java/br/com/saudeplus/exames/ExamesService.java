package br.com.saudeplus.exames;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.text.Normalizer;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import br.com.saudeplus.agendamentos.AgendamentoRepository;
import br.com.saudeplus.arquivos.ArmazenamentoArquivos;
import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.arquivos.TipoDeArquivo;
import br.com.saudeplus.clinicas.Unidade;
import br.com.saudeplus.clinicas.UnidadeRepository;
import br.com.saudeplus.exames.EventosDeExame.ExameAgendado;
import br.com.saudeplus.exames.EventosDeExame.ExameSolicitado;
import br.com.saudeplus.exames.EventosDeExame.ResultadoLiberado;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.pacientes.Paciente;
import br.com.saudeplus.pacientes.PacienteRepository;
import br.com.saudeplus.profissionais.Medico;

/**
 * Ciclo de um exame: o médico pede, a clínica agenda a coleta, analisa e
 * anexa o resultado, e paciente e médico baixam o arquivo. Cada passo que
 * interessa a alguém vira notificação (ver `NotificacoesDeExame`).
 */
@Service
public class ExamesService {

    /** Limite do arquivo de resultado. O `spring.servlet.multipart` barra antes, com folga. */
    static final long TAMANHO_MAXIMO = 10L * 1024 * 1024;

    private final ExameRepository exames;
    private final TipoExameRepository tipos;
    private final PacienteRepository pacientes;
    private final AgendamentoRepository agendamentos;
    private final UnidadeRepository unidades;
    private final ArmazenamentoArquivos armazenamento;
    private final ApplicationEventPublisher eventos;
    private final Auditoria auditoria;
    private final Clock relogio;

    public ExamesService(ExameRepository exames, TipoExameRepository tipos, PacienteRepository pacientes,
            AgendamentoRepository agendamentos, UnidadeRepository unidades, ArmazenamentoArquivos armazenamento,
            ApplicationEventPublisher eventos, Auditoria auditoria, Clock relogio) {
        this.exames = exames;
        this.tipos = tipos;
        this.pacientes = pacientes;
        this.agendamentos = agendamentos;
        this.unidades = unidades;
        this.armazenamento = armazenamento;
        this.eventos = eventos;
        this.auditoria = auditoria;
        this.relogio = relogio;
    }

    /**
     * O médico só pede exame para quem é paciente dele (tem ou teve consulta
     * com ele); para os demais, o paciente "não existe" (404).
     */
    @Transactional
    public Exame solicitar(Medico medico, UUID pacienteId, UUID tipoExameId, LocalDate prazo, UUID agendamentoOrigemId) {
        if (!agendamentos.existsByMedicoIdAndPacienteId(medico.getId(), pacienteId)) {
            throw RecursoNaoEncontradoException.de("Paciente", pacienteId.toString());
        }
        Paciente paciente = pacientes.getReferenceById(pacienteId);
        TipoExame tipo = tipos.findById(tipoExameId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Tipo de exame", tipoExameId.toString()));
        if (prazo != null && prazo.isBefore(LocalDate.now(relogio))) {
            throw RequisicaoInvalidaException.noCampo("prazo", "O prazo não pode ser uma data passada.");
        }
        Exame exame = new Exame(paciente, medico, tipo, prazo);
        if (agendamentoOrigemId != null) {
            agendamentos.findByIdAndMedicoId(agendamentoOrigemId, medico.getId())
                    .filter(a -> a.getPaciente().getId().equals(pacienteId))
                    .orElseThrow(() -> new RegraDeNegocioException("A consulta de origem não é deste paciente com você."));
            exame.vincularConsulta(agendamentoOrigemId);
        }
        exames.save(exame);
        eventos.publishEvent(new ExameSolicitado(exame.getId()));
        return exame;
    }

    /** A clínica marca a coleta. `quando` é horário local da unidade. */
    @Transactional
    public Exame agendar(UUID exameId, LocalDateTime quando, UUID unidadeId) {
        if (!quando.isAfter(LocalDateTime.now(relogio))) {
            throw RequisicaoInvalidaException.noCampo("dataHora", "A coleta precisa ser marcada para o futuro.");
        }
        Exame exame = buscar(exameId);
        Unidade unidade = unidades.findById(unidadeId)
                .filter(Unidade::ativa)
                .orElseThrow(() -> new RegraDeNegocioException("Unidade inexistente ou fora de funcionamento."));
        exame.agendar(quando.atZone(relogio.getZone()).toInstant(), unidade);
        auditoria.registrar("exame.agendar", "exame", exameId, Map.of("dataHora", quando.toString()));
        eventos.publishEvent(new ExameAgendado(exame.getId()));
        return exame;
    }

    @Transactional
    public Exame iniciarAnalise(UUID exameId) {
        Exame exame = buscar(exameId);
        exame.iniciarAnalise();
        auditoria.registrar("exame.analise", "exame", exameId, Map.of());
        return exame;
    }

    @Transactional
    public Exame cancelar(UUID exameId) {
        Exame exame = buscar(exameId);
        exame.cancelar();
        auditoria.registrar("exame.cancelar", "exame", exameId, Map.of());
        return exame;
    }

    /**
     * Anexa o resultado (PDF, PNG ou JPEG até 10 MB) e libera para o paciente.
     * O arquivo substituído só é apagado depois do commit: se a transação
     * falhar, o resultado antigo continua lá.
     */
    @Transactional
    public Exame liberarResultado(UUID exameId, MultipartFile arquivo) {
        Exame exame = buscar(exameId);
        if (arquivo == null || arquivo.isEmpty()) {
            throw RequisicaoInvalidaException.noCampo("arquivo", "Envie o arquivo do resultado.");
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO) {
            throw RequisicaoInvalidaException.noCampo("arquivo", "O arquivo deve ter até 10 MB.");
        }
        byte[] conteudo = ler(arquivo);
        TipoDeArquivo tipo = TipoDeArquivo.detectar(conteudo)
                .orElseThrow(() -> RequisicaoInvalidaException.noCampo("arquivo", "Envie um PDF, PNG ou JPEG."));
        String chave = armazenamento.guardar(conteudo, tipo);
        String anterior = exame.liberarResultado(chave, relogio.instant());
        if (anterior != null) {
            depoisDoCommit(() -> armazenamento.remover(anterior));
        }
        auditoria.registrar("exame.resultado", "exame", exameId,
                Map.of("tipo", tipo.name(), "bytes", conteudo.length, "substituiu", anterior != null));
        eventos.publishEvent(new ResultadoLiberado(exame.getId()));
        return exame;
    }

    /** O arquivo do resultado, pronto para devolver; sem resultado liberado, 404. */
    public ArquivoDoResultado arquivo(Exame exame) {
        if (!exame.resultadoDisponivel()) {
            throw new RecursoNaoEncontradoException("O resultado deste exame ainda não foi liberado.");
        }
        TipoDeArquivo tipo = TipoDeArquivo.porExtensao(exame.getResultadoPath())
                .orElseThrow(() -> new IllegalStateException("Resultado com extensão desconhecida: " + exame.getResultadoPath()));
        String nome = "resultado-%s.%s".formatted(slug(exame.getTipo().getNome()), tipo.extensao());
        return new ArquivoDoResultado(armazenamento.ler(exame.getResultadoPath()), tipo.contentType(), nome);
    }

    public record ArquivoDoResultado(Resource conteudo, String contentType, String nomeDoArquivo) {
    }

    private Exame buscar(UUID exameId) {
        return exames.findCompletoById(exameId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Exame", exameId.toString()));
    }

    private static byte[] ler(MultipartFile arquivo) {
        try {
            return arquivo.getBytes();
        } catch (IOException excecao) {
            throw new UncheckedIOException("Não foi possível ler o arquivo enviado.", excecao);
        }
    }

    private static void depoisDoCommit(Runnable acao) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                acao.run();
            }
        });
    }

    /** "Raio-X de tórax" → "raio-x-de-torax", para o nome do arquivo baixado. */
    private static String slug(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
