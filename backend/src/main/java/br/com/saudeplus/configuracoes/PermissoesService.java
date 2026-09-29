package br.com.saudeplus.configuracoes;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.saudeplus.auditoria.Auditoria;
import br.com.saudeplus.exception.RequisicaoInvalidaException;
import br.com.saudeplus.usuarios.Papel;

/**
 * Matriz papel × módulo da área administrativa (tabela `permissoes`).
 *
 * ADMIN tem tudo, sempre: as linhas dele não são editáveis. PACIENTE nunca
 * entra na matriz. A matriz fica em memória e é recarregada ao salvar, porque
 * é consultada a cada requisição a `/api/admin/**` (ver `AcessoAoAdmin`).
 */
@Service
public class PermissoesService {

    /** Papéis que a administração pode liberar ou não em cada módulo. */
    public static final List<Papel> PAPEIS_EDITAVEIS =
            List.of(Papel.GESTOR, Papel.MEDICO, Papel.ENFERMEIRO, Papel.RECEPCIONISTA, Papel.AGENTE);

    private static final String ACAO = "acessar";

    private final JdbcClient jdbc;
    private final Auditoria auditoria;
    private volatile Map<Papel, Set<ModuloAdmin>> cache;

    public PermissoesService(JdbcClient jdbc, Auditoria auditoria) {
        this.jdbc = jdbc;
        this.auditoria = auditoria;
    }

    public boolean permite(Papel papel, ModuloAdmin modulo) {
        return papel == Papel.ADMIN || matriz().getOrDefault(papel, Set.of()).contains(modulo);
    }

    /** Módulos que o papel pode abrir, na ordem do menu. */
    public List<ModuloAdmin> modulosDe(Papel papel) {
        return EnumSet.allOf(ModuloAdmin.class).stream().filter(m -> permite(papel, m)).toList();
    }

    /** `{ modulo: { papel: true/false } }`, com todos os módulos e papéis editáveis. */
    public Map<String, Map<String, Boolean>> comoMatriz() {
        Map<String, Map<String, Boolean>> resultado = new LinkedHashMap<>();
        for (ModuloAdmin modulo : ModuloAdmin.values()) {
            Map<String, Boolean> linha = new LinkedHashMap<>();
            for (Papel papel : PAPEIS_EDITAVEIS) {
                linha.put(papel.name(), permite(papel, modulo));
            }
            resultado.put(modulo.chave(), linha);
        }
        return resultado;
    }

    /**
     * Substitui a matriz dos papéis editáveis. Módulo ou papel desconhecido é
     * erro (400); papel ausente no corpo fica sem nenhum módulo.
     */
    @Transactional
    public Map<String, Map<String, Boolean>> salvar(Map<String, Map<String, Boolean>> nova) {
        List<Object[]> linhas = new ArrayList<>();
        nova.forEach((chaveDoModulo, porPapel) -> {
            ModuloAdmin modulo = ModuloAdmin.porChave(chaveDoModulo).orElseThrow(() ->
                    new RequisicaoInvalidaException("Dados inválidos", "Módulo desconhecido: " + chaveDoModulo));
            porPapel.forEach((nomeDoPapel, liberado) -> {
                Papel papel = PAPEIS_EDITAVEIS.stream().filter(p -> p.name().equals(nomeDoPapel)).findFirst()
                        .orElseThrow(() -> new RequisicaoInvalidaException("Dados inválidos",
                                "Papel não editável: " + nomeDoPapel));
                if (Boolean.TRUE.equals(liberado)) {
                    linhas.add(new Object[] {papel.name(), modulo.chave()});
                }
            });
        });
        jdbc.sql("delete from permissoes where papel <> 'ADMIN'").update();
        for (Object[] linha : linhas) {
            jdbc.sql("insert into permissoes (papel, modulo, acao) values (?, ?, ?)")
                    .params(linha[0], linha[1], ACAO).update();
        }
        cache = null;
        auditoria.registrar("permissoes.alterar", "permissoes", null, Map.of("liberacoes", linhas.size()));
        return comoMatriz();
    }

    private Map<Papel, Set<ModuloAdmin>> matriz() {
        Map<Papel, Set<ModuloAdmin>> atual = cache;
        if (atual == null) {
            atual = carregar();
            cache = atual;
        }
        return atual;
    }

    private Map<Papel, Set<ModuloAdmin>> carregar() {
        Map<Papel, Set<ModuloAdmin>> carregada = new EnumMap<>(Papel.class);
        jdbc.sql("select papel, modulo from permissoes where acao = ?").param(ACAO)
                .query((linha, n) -> new String[] {linha.getString("papel"), linha.getString("modulo")})
                .list()
                .forEach(par -> {
                    Papel papel;
                    try {
                        papel = Papel.valueOf(par[0]);
                    } catch (IllegalArgumentException excecao) {
                        return;
                    }
                    ModuloAdmin.porChave(par[1]).ifPresent(modulo ->
                            carregada.computeIfAbsent(papel, p -> EnumSet.noneOf(ModuloAdmin.class)).add(modulo));
                });
        return carregada;
    }
}
