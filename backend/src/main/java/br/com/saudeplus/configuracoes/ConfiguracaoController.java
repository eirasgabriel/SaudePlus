package br.com.saudeplus.configuracoes;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ConfiguracaoController {

    @GetMapping("/configuracoes")
    public ResponseEntity<Map<String, Object>> listar() {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("abas", List.of(
                Map.of("id", "geral", "rotulo", "Geral", "icone", "engrenagem"),
                Map.of("id", "usuarios", "rotulo", "Usuários e Permissões", "icone", "usuario"),
                Map.of("id", "clinicas", "rotulo", "Clínicas e Unidades", "icone", "predio"),
                Map.of("id", "notificacoes", "rotulo", "Notificações", "icone", "sino"),
                Map.of("id", "integracoes", "rotulo", "Integrações", "icone", "link"),
                Map.of("id", "seguranca", "rotulo", "Segurança", "icone", "escudoCheck")
        ));

        Map<String, String> subtitulos = new LinkedHashMap<>();
        subtitulos.put("geral", "Gerencie as configurações do sistema SaúdePlus.");
        subtitulos.put("usuarios", "Gerenciamento de usuários, permissões e acessos do sistema SaúdePlus.");
        subtitulos.put("clinicas", "Gerencie as clínicas e unidades do sistema SaúdePlus.");
        subtitulos.put("notificacoes", "Gerencie as notificações do sistema SaúdePlus.");
        subtitulos.put("integracoes", "Gerencie as integrações e conexões externas do sistema SaúdePlus.");
        subtitulos.put("seguranca", "Proteja os dados e garanta o acesso seguro ao sistema.");
        response.put("subtitulos", subtitulos);

        Map<String, Object> gerais = new LinkedHashMap<>();
        gerais.put("nomeSistema", "SaúdePlus");
        gerais.put("descricao", "Plataforma de acesso à saúde pública de Saquarema. Mais praticidade, informação e cuidado para você.");
        gerais.put("emailSuporte", "suporte@saudeplus.com");
        gerais.put("telefone", "(22) 99876-5432");
        gerais.put("endereco", "Rua das Flores, 123 - Saquarema, RJ");
        gerais.put("idioma", "pt-BR");
        gerais.put("fusoHorario", "America/Sao_Paulo");
        gerais.put("corPrincipal", "#0066FF");
        gerais.put("corSecundaria", "#7DD3FC");
        gerais.put("tema", "claro");
        response.put("configuracoesGerais", gerais);

        response.put("opcoesIdioma", List.of(
                Map.of("valor", "pt-BR", "rotulo", "Português (Brasil)"),
                Map.of("valor", "en-US", "rotulo", "English (US)"),
                Map.of("valor", "es-ES", "rotulo", "Español")
        ));

        response.put("opcoesFuso", List.of(
                Map.of("valor", "America/Sao_Paulo", "rotulo", "America/Sao_Paulo (GMT -03:00)"),
                Map.of("valor", "America/Manaus", "rotulo", "America/Manaus (GMT -04:00)"),
                Map.of("valor", "America/Noronha", "rotulo", "America/Noronha (GMT -02:00)")
        ));

        response.put("notificacoesSistema", List.of(
                Map.of("id", "novos", "titulo", "Novos agendamentos", "descricao", "Notificar sobre novos agendamentos realizados", "ativo", true),
                Map.of("id", "cancelamentos", "titulo", "Cancelamentos", "descricao", "Notificar sobre cancelamentos de consultas", "ativo", true),
                Map.of("id", "lembretes", "titulo", "Lembretes de consulta", "descricao", "Enviar lembretes 24h antes da consulta", "ativo", true),
                Map.of("id", "atualizacoes", "titulo", "Atualizações do sistema", "descricao", "Receber avisos sobre novas versões", "ativo", false),
                Map.of("id", "semanais", "titulo", "Relatórios semanais", "descricao", "Receber resumo das atividades por e-mail", "ativo", true)
        ));

        Map<String, String> backup = new LinkedHashMap<>();
        backup.put("ultimo", "15/09/2026 às 02:00");
        backup.put("status", "Concluído");
        response.put("backupSistema", backup);

        response.put("informacoesSistema", List.of(
                Map.of("rotulo", "Versão do sistema", "valor", "v2.8.0"),
                Map.of("rotulo", "Banco de dados", "valor", "PostgreSQL 15"),
                Map.of("rotulo", "Servidor", "valor", "saudeplus-app"),
                Map.of("rotulo", "Última atualização", "valor", "15/09/2026 01:45")
        ));

        return ResponseEntity.ok(response);
    }
}
