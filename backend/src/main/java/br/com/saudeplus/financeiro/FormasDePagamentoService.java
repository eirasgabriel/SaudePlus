package br.com.saudeplus.financeiro;

import java.util.Arrays;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.configuracoes.Configuracao;
import br.com.saudeplus.configuracoes.ConfiguracaoRepository;
import br.com.saudeplus.exception.RegraDeNegocioException;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Formas de pagamento aceitas na baixa de cobranças. Guarda só as
 * desativadas (`{"desativadas": ["boleto"]}`), então uma forma nova nasce
 * ativa. Fica fora do `PUT /configuracoes/{grupo}` genérico porque o formato
 * é validado aqui.
 */
@Service
public class FormasDePagamentoService {

    static final String CHAVE = "formas-pagamento";

    private final ConfiguracaoRepository configuracoes;
    private final JsonMapper json;
    private final Auditoria auditoria;

    public FormasDePagamentoService(ConfiguracaoRepository configuracoes, JsonMapper json, Auditoria auditoria) {
        this.configuracoes = configuracoes;
        this.json = json;
        this.auditoria = auditoria;
    }

    public record FormaResposta(FormaPagamento forma, String rotulo, boolean ativa) {
    }

    @Transactional(readOnly = true)
    public List<FormaResposta> listar() {
        Set<FormaPagamento> desativadas = desativadas();
        return Arrays.stream(FormaPagamento.values())
                .map(f -> new FormaResposta(f, f.rotulo(), !desativadas.contains(f)))
                .toList();
    }

    /** Substitui o conjunto de formas ativas; as demais ficam desativadas. */
    @Transactional
    public List<FormaResposta> definirAtivas(Collection<FormaPagamento> ativas) {
        if (ativas == null || ativas.isEmpty()) {
            throw RequisicaoInvalidaException.noCampo("ativas", "Deixe ao menos uma forma de pagamento ativa.");
        }
        Set<FormaPagamento> desativadas = EnumSet.allOf(FormaPagamento.class);
        desativadas.removeAll(ativas);
        String valor = json.writeValueAsString(
                Map.of("desativadas", desativadas.stream().map(FormaPagamento::chave).toList()));
        configuracoes.findById(CHAVE).ifPresentOrElse(c -> c.alterar(valor),
                () -> configuracoes.save(new Configuracao(CHAVE, valor)));
        auditoria.registrar("financeiro.formas", "configuracao", null,
                Map.of("ativas", ativas.stream().map(FormaPagamento::chave).sorted().toList()));
        return listar();
    }

    /** Baixa com forma desativada é recusada (422). */
    @Transactional(readOnly = true)
    public void exigirAtiva(FormaPagamento forma) {
        if (forma != null && desativadas().contains(forma)) {
            throw new RegraDeNegocioException(
                    "A forma de pagamento \"%s\" está desativada. Ative-a no financeiro ou escolha outra.".formatted(forma.rotulo()));
        }
    }

    private Set<FormaPagamento> desativadas() {
        Set<FormaPagamento> desativadas = EnumSet.noneOf(FormaPagamento.class);
        configuracoes.findById(CHAVE).ifPresent(c -> {
            JsonNode lista = json.readTree(c.getValor()).get("desativadas");
            if (lista != null) {
                lista.forEach(item -> desativadas.add(FormaPagamento.porChave(item.asString())));
            }
        });
        return desativadas;
    }
}
