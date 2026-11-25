package br.com.saudeplus.publico;

import java.util.regex.Pattern;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.configuracoes.ConfiguracoesService;
import tools.jackson.databind.JsonNode;

/**
 * O que o site mostra a partir de Configurações > Geral: nome, descrição,
 * contatos e cores. Só esses campos saem daqui, sem login; o resto do grupo
 * `gerais` continua restrito à administração. Campo não gravado vem nulo, e
 * o site usa o próprio padrão.
 */
@RestController
@RequestMapping("/api/publico")
public class IdentidadeDoSiteController {

    /** Só cor em hexadecimal chega ao CSS do site. */
    private static final Pattern COR = Pattern.compile("#[0-9a-fA-F]{6}");

    private final ConfiguracoesService configuracoes;

    public IdentidadeDoSiteController(ConfiguracoesService configuracoes) {
        this.configuracoes = configuracoes;
    }

    public record IdentidadeDoSite(String nomeSistema, String descricao, String emailSuporte, String telefone,
            String endereco, String corPrincipal, String corSecundaria) {
    }

    @GetMapping("/identidade")
    public IdentidadeDoSite identidade() {
        JsonNode gerais = configuracoes.grupo("gerais");
        return new IdentidadeDoSite(
                texto(gerais, "nomeSistema"),
                texto(gerais, "descricao"),
                texto(gerais, "emailSuporte"),
                texto(gerais, "telefone"),
                texto(gerais, "endereco"),
                cor(gerais, "corPrincipal"),
                cor(gerais, "corSecundaria"));
    }

    private static String texto(JsonNode grupo, String campo) {
        JsonNode valor = grupo.get(campo);
        if (valor == null || !valor.isString() || valor.asString().isBlank()) {
            return null;
        }
        return valor.asString().strip();
    }

    private static String cor(JsonNode grupo, String campo) {
        String valor = texto(grupo, campo);
        return valor != null && COR.matcher(valor).matches() ? valor : null;
    }
}
