package br.com.saudeplus.configuracoes;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Módulos da área administrativa e as rotas `/api/admin/*` de cada um. É a
 * unidade da matriz de permissões: um papel de equipe liberado em
 * "agendamentos" acessa as rotas desse módulo.
 *
 * Rotas fora desta lista (permissões e auditoria) são só do ADMIN.
 */
public enum ModuloAdmin {
    DASHBOARD("dashboard", "Dashboard", "dashboard"),
    USUARIOS("usuarios", "Usuários", "usuarios"),
    CLINICAS("clinicas", "Clínicas", "unidades", "especialidades", "convenios", "tipos-exame"),
    AGENDAMENTOS("agendamentos", "Agendamentos", "agendamentos", "exames"),
    RELATORIOS("relatorios", "Relatórios", "relatorios"),
    FINANCEIRO("financeiro", "Financeiro", "financeiro"),
    CONFIGURACOES("configuracoes", "Configurações", "configuracoes");

    private final String chave;
    private final String rotulo;
    private final List<String> recursos;

    ModuloAdmin(String chave, String rotulo, String... recursos) {
        this.chave = chave;
        this.rotulo = rotulo;
        this.recursos = List.of(recursos);
    }

    /** "/api/admin/unidades/…" → CLINICAS. */
    public static Optional<ModuloAdmin> doCaminho(String caminho) {
        String resto = caminho.replaceFirst("^/api/admin/?", "");
        String recurso = resto.contains("/") ? resto.substring(0, resto.indexOf('/')) : resto;
        return Arrays.stream(values()).filter(m -> m.recursos.contains(recurso)).findFirst();
    }

    public static Optional<ModuloAdmin> porChave(String chave) {
        return Arrays.stream(values()).filter(m -> m.chave.equals(chave)).findFirst();
    }

    @JsonValue
    public String chave() {
        return chave;
    }

    public String rotulo() {
        return rotulo;
    }
}
