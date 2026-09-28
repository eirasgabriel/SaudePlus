package br.com.saudeplus.relatorios;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RelatorioController {

    @GetMapping("/relatorios")
    public ResponseEntity<Map<String, Object>> listar() {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("metricas", List.of(
                Map.of("id", "atendimentos", "rotulo", "Total de atendimentos", "valor", "2.348", "icone", "usuarios",
                        "nota", "no período selecionado", "variacao", Map.of("valor", "12%", "tendencia", "sobe")),
                Map.of("id", "agendamentos", "rotulo", "Agendamentos realizados", "valor", "2.176", "icone", "calendarioMais",
                        "nota", "no período selecionado", "variacao", Map.of("valor", "15%", "tendencia", "sobe")),
                Map.of("id", "pacientes", "rotulo", "Pacientes atendidos", "valor", "1.842", "icone", "usuario",
                        "nota", "no período selecionado", "variacao", Map.of("valor", "10%", "tendencia", "sobe")),
                Map.of("id", "espera", "rotulo", "Tempo médio de espera", "valor", "18 min", "icone", "relogio",
                        "nota", "no período selecionado", "variacao", Map.of("valor", "6%", "tendencia", "desce")),
                Map.of("id", "cancelamentos", "rotulo", "Cancelamentos", "valor", "156", "icone", "alertaX",
                        "nota", "no período selecionado", "tom", "vermelho", "variacao", Map.of("valor", "3%", "tendencia", "sobe"))
        ));

        Map<String, Object> porEspecialidade = new LinkedHashMap<>();
        porEspecialidade.put("total", "2.348");
        porEspecialidade.put("descricao", "atendimentos");
        porEspecialidade.put("fatias", List.of(
                Map.of("id", "geral", "rotulo", "Clínica Geral", "percentual", 34, "cor", "var(--azul)"),
                Map.of("id", "pediatria", "rotulo", "Pediatria", "percentual", 18, "cor", "var(--azul-suave)"),
                Map.of("id", "ginecologia", "rotulo", "Ginecologia", "percentual", 14, "cor", "var(--verde-claro)"),
                Map.of("id", "ortopedia", "rotulo", "Ortopedia", "percentual", 10, "cor", "var(--roxo)"),
                Map.of("id", "outras", "rotulo", "Outras", "percentual", 24, "cor", "#c4b5fd")
        ));
        response.put("porEspecialidade", porEspecialidade);

        Map<String, Object> evolucaoAtendimentos = new LinkedHashMap<>();
        evolucaoAtendimentos.put("escalaMaxima", 2500);
        evolucaoAtendimentos.put("passo", 500);
        evolucaoAtendimentos.put("dados", List.of(
                Map.of("rotulo", "Jan", "valor", 920),
                Map.of("rotulo", "Fev", "valor", 1010),
                Map.of("rotulo", "Mar", "valor", 1180),
                Map.of("rotulo", "Abr", "valor", 1280),
                Map.of("rotulo", "Mai", "valor", 1420),
                Map.of("rotulo", "Jun", "valor", 1560),
                Map.of("rotulo", "Jul", "valor", 1700),
                Map.of("rotulo", "Ago", "valor", 1980),
                Map.of("rotulo", "Set", "valor", 2180),
                Map.of("rotulo", "Out", "valor", 2280)
        ));
        response.put("evolucaoAtendimentos", evolucaoAtendimentos);

        response.put("porFaixaEtaria", List.of(
                Map.of("rotulo", "0 a 18 anos", "percentual", 22),
                Map.of("rotulo", "19 a 30 anos", "percentual", 34),
                Map.of("rotulo", "31 a 50 anos", "percentual", 26),
                Map.of("rotulo", "51 a 70 anos", "percentual", 12),
                Map.of("rotulo", "+ 70 anos", "percentual", 6)
        ));

        response.put("relatoriosDisponiveis", List.of(
                Map.of("id", "atendimentos", "titulo", "Relatório de Atendimentos", "descricao", "Lista de atendimentos realizados no período selecionado.", "icone", "grafico"),
                Map.of("id", "agendamentos", "titulo", "Relatório de Agendamentos", "descricao", "Detalhamento dos agendamentos por data, unidade e especialidade.", "icone", "calendario"),
                Map.of("id", "pacientes", "titulo", "Relatório de Pacientes", "descricao", "Informações cadastrais e histórico de atendimentos.", "icone", "usuarios"),
                Map.of("id", "financeiro", "titulo", "Relatório Financeiro", "descricao", "Movimentações financeiras e faturamento das clínicas.", "icone", "banco"),
                Map.of("id", "cancelamentos", "titulo", "Relatório de Cancelamentos", "descricao", "Motivos e quantidade de agendamentos cancelados.", "icone", "alertaX")
        ));

        response.put("resumoPeriodo", List.of(
                Map.of("id", "unidade", "rotulo", "Atendimentos por unidade", "valor", "1.245", "icone", "clinica"),
                Map.of("id", "profissional", "rotulo", "Atendimentos por profissional", "valor", "1.103", "icone", "usuarios"),
                Map.of("id", "consultas", "rotulo", "Consultas", "valor", "1.876", "icone", "estetoscopio"),
                Map.of("id", "exames", "rotulo", "Exames", "valor", "472", "icone", "frasco"),
                Map.of("id", "retornos", "rotulo", "Retornos", "valor", "356", "icone", "atualizar")
        ));

        response.put("opcoesProfissional", List.of(
                Map.of("valor", "todos", "rotulo", "Todos os profissionais"),
                Map.of("valor", "ana", "rotulo", "Dra. Ana Costa"),
                Map.of("valor", "carlos", "rotulo", "Dr. Carlos Mendes"),
                Map.of("valor", "rafael", "rotulo", "Dr. Rafael Lima"),
                Map.of("valor", "fernanda", "rotulo", "Dra. Fernanda Rocha")
        ));

        response.put("opcoesUnidade", List.of(
                Map.of("valor", "todas", "rotulo", "Todas as unidades"),
                Map.of("valor", "centro", "rotulo", "Clínica da Família - Centro"),
                Map.of("valor", "jacone", "rotulo", "Posto de Saúde - Jaconé"),
                Map.of("valor", "policlinica", "rotulo", "Policlínica Municipal"),
                Map.of("valor", "hospital", "rotulo", "Hospital Municipal")
        ));

        response.put("opcoesStatus", List.of(
                Map.of("valor", "todos", "rotulo", "Todos os status"),
                Map.of("valor", "confirmado", "rotulo", "Confirmados"),
                Map.of("valor", "espera", "rotulo", "Em espera"),
                Map.of("valor", "cancelado", "rotulo", "Cancelados")
        ));

        response.put("opcoesEspecialidade", List.of(
                Map.of("valor", "todas", "rotulo", "Todas as especialidades"),
                Map.of("valor", "geral", "rotulo", "Clínica Geral"),
                Map.of("valor", "pediatria", "rotulo", "Pediatria"),
                Map.of("valor", "ginecologia", "rotulo", "Ginecologia"),
                Map.of("valor", "ortopedia", "rotulo", "Ortopedia")
        ));

        response.put("opcoesFormato", List.of(
                Map.of("valor", "pdf", "rotulo", "PDF"),
                Map.of("valor", "excel", "rotulo", "Excel (.xlsx)"),
                Map.of("valor", "csv", "rotulo", "CSV")
        ));

        response.put("opcoesPeriodo", List.of(
                Map.of("valor", "30d", "rotulo", "15 de setembro de 2026 - 15 de outubro de 2026"),
                Map.of("valor", "7d", "rotulo", "Últimos 7 dias"),
                Map.of("valor", "90d", "rotulo", "Últimos 90 dias"),
                Map.of("valor", "ano", "rotulo", "Este ano")
        ));

        return ResponseEntity.ok(response);
    }
}
