package br.com.saudeplus.configuracoes;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.exception.RecursoNaoEncontradoException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * Configurações do sistema por grupo (`gerais`, `agendamento`, `seguranca`,
 * `notificacoes`, `integracoes`). Cada grupo é um objeto JSON livre, salvo o
 * `agendamento`, cujos números são validados porque mudam regras de reserva
 * (ver `RegrasDaAgenda`).
 */
@Service
public class ConfiguracoesService {

    public static final String AGENDAMENTO = "agendamento";
    static final Set<String> GRUPOS = Set.of("gerais", AGENDAMENTO, "seguranca", "notificacoes", "integracoes");

    /** Limites aceitos para cada regra do grupo `agendamento`. */
    private static final Map<String, int[]> LIMITES_DA_AGENDA = Map.of(
            "antecedenciaMinimaHoras", new int[] {0, 72},
            "antecedenciaCancelamentoHoras", new int[] {0, 168},
            "janelaAgendamentoDias", new int[] {1, 365});

    private final ConfiguracaoRepository configuracoes;
    private final JsonMapper json;
    private final Auditoria auditoria;

    public ConfiguracoesService(ConfiguracaoRepository configuracoes, JsonMapper json, Auditoria auditoria) {
        this.configuracoes = configuracoes;
        this.json = json;
        this.auditoria = auditoria;
    }

    @Transactional(readOnly = true)
    public Map<String, JsonNode> todas() {
        Map<String, JsonNode> grupos = new LinkedHashMap<>();
        configuracoes.findAll().stream()
                .sorted((a, b) -> a.getChave().compareTo(b.getChave()))
                .forEach(c -> grupos.put(c.getChave(), json.readTree(c.getValor())));
        return grupos;
    }

    /** O objeto do grupo, ou vazio se ainda não foi gravado. */
    @Transactional(readOnly = true)
    public JsonNode grupo(String chave) {
        return configuracoes.findById(chave).map(c -> json.readTree(c.getValor())).orElseGet(json::createObjectNode);
    }

    /** Substitui o objeto inteiro do grupo. */
    @Transactional
    public JsonNode alterar(String chave, JsonNode valor) {
        if (!GRUPOS.contains(chave)) {
            throw new RecursoNaoEncontradoException("Grupo de configurações desconhecido: " + chave);
        }
        if (valor == null || !valor.isObject()) {
            throw new RequisicaoInvalidaException("Dados inválidos", "Envie um objeto JSON com as configurações do grupo.");
        }
        if (AGENDAMENTO.equals(chave)) {
            validarAgenda((ObjectNode) valor);
        }
        String texto = json.writeValueAsString(valor);
        configuracoes.findById(chave).ifPresentOrElse(c -> c.alterar(texto),
                () -> configuracoes.save(new Configuracao(chave, texto)));
        auditoria.registrar("configuracao.alterar", "configuracao", null, Map.of("grupo", chave));
        return valor;
    }

    private static void validarAgenda(ObjectNode valor) {
        LIMITES_DA_AGENDA.forEach((campo, limites) -> {
            JsonNode no = valor.get(campo);
            if (no == null) {
                return;
            }
            if (!no.isIntegralNumber() || no.asInt() < limites[0] || no.asInt() > limites[1]) {
                throw RequisicaoInvalidaException.noCampo(campo,
                        "Use um número inteiro de %d a %d.".formatted(limites[0], limites[1]));
            }
        });
    }

    List<String> grupos() {
        return GRUPOS.stream().sorted().toList();
    }
}
