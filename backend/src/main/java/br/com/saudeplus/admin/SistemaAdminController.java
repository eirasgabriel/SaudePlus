package br.com.saudeplus.admin;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.saudeplus.admin.DashboardAdminService.Dashboard;
import br.com.saudeplus.auditoria.AuditoriaService;
import br.com.saudeplus.comum.Pagina;
import br.com.saudeplus.configuracoes.ConfiguracoesService;
import br.com.saudeplus.configuracoes.ModuloAdmin;
import br.com.saudeplus.configuracoes.PermissoesService;
import br.com.saudeplus.security.UsuarioAutenticado;
import br.com.saudeplus.usuarios.Papel;
import tools.jackson.databind.JsonNode;

/**
 * Dashboard, configurações, permissões, auditoria e informações do sistema.
 * Dashboard e configurações são módulos da matriz; permissões, auditoria e
 * sistema são só do ADMIN (ver `AcessoAoAdmin`).
 */
@RestController
@RequestMapping("/api/admin")
public class SistemaAdminController {

    private final DashboardAdminService dashboard;
    private final ConfiguracoesService configuracoes;
    private final PermissoesService permissoes;
    private final AuditoriaService auditoria;
    private final InformacoesDoSistemaService informacoes;

    public SistemaAdminController(DashboardAdminService dashboard, ConfiguracoesService configuracoes,
            PermissoesService permissoes, AuditoriaService auditoria, InformacoesDoSistemaService informacoes) {
        this.dashboard = dashboard;
        this.configuracoes = configuracoes;
        this.permissoes = permissoes;
        this.auditoria = auditoria;
        this.informacoes = informacoes;
    }

    /** `meses`: quantos meses o gráfico de agendamentos cobre (1 a 24). */
    @GetMapping("/dashboard")
    public Dashboard dashboard(@AuthenticationPrincipal UsuarioAutenticado usuario,
            @RequestParam(defaultValue = "9") int meses) {
        return dashboard.montar(usuario, meses);
    }

    @GetMapping("/configuracoes")
    public Map<String, JsonNode> configuracoes() {
        return configuracoes.todas();
    }

    /** Substitui o objeto do grupo (`gerais`, `agendamento`, `seguranca`, `notificacoes`, `integracoes`). */
    @PutMapping("/configuracoes/{grupo}")
    public JsonNode alterarConfiguracao(@PathVariable String grupo, @RequestBody JsonNode valor) {
        return configuracoes.alterar(grupo, valor);
    }

    public record Rotulado(String id, String rotulo) {
    }

    /** Matriz `{ modulo: { PAPEL: true/false } }`, com a lista de módulos e de papéis editáveis. */
    public record Permissoes(List<Rotulado> modulos, List<Rotulado> papeis, Map<String, Map<String, Boolean>> matriz) {
    }

    @GetMapping("/permissoes")
    public Permissoes permissoes() {
        return comRotulos(permissoes.comoMatriz());
    }

    @PutMapping("/permissoes")
    public Permissoes alterarPermissoes(@RequestBody Map<String, Map<String, Boolean>> matriz) {
        return comRotulos(permissoes.salvar(matriz));
    }

    /** Versão, banco, última migração e início do servidor. Só do ADMIN (não é módulo da matriz). */
    @GetMapping("/sistema")
    public InformacoesDoSistemaService.Informacoes sistema() {
        return informacoes.montar();
    }

    @GetMapping("/auditoria")
    public Pagina<AuditoriaService.Registro> auditoria(@RequestParam(required = false) UUID usuarioId,
            @RequestParam(required = false) String acao,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate,
            @RequestParam(defaultValue = "0") int pagina, @RequestParam(defaultValue = "50") int tamanho) {
        return auditoria.listar(usuarioId, acao, de, ate, pagina, tamanho);
    }

    private static Permissoes comRotulos(Map<String, Map<String, Boolean>> matriz) {
        return new Permissoes(
                Arrays.stream(ModuloAdmin.values()).map(m -> new Rotulado(m.chave(), m.rotulo())).toList(),
                PermissoesService.PAPEIS_EDITAVEIS.stream().map(p -> new Rotulado(p.name(), rotulo(p))).toList(),
                matriz);
    }

    private static String rotulo(Papel papel) {
        return switch (papel) {
            case GESTOR -> "Gestor";
            case MEDICO -> "Médico";
            case ENFERMEIRO -> "Enfermeiro";
            case RECEPCIONISTA -> "Recepcionista";
            case AGENTE -> "Agente comunitário";
            case ADMIN -> "Administrador";
            case PACIENTE -> "Paciente";
        };
    }
}
