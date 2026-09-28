package br.com.saudeplus.financeiro;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FinanceiroController {

    @GetMapping("/financeiro")
    public ResponseEntity<Map<String, Object>> listar() {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("metricas", List.of(
                Map.of("id", "receita", "rotulo", "Receita Total", "valor", "R$ 48.750,00", "icone", "carteira",
                        "variacao", Map.of("valor", "12% em relação ao mês anterior", "tendencia", "sobe")),
                Map.of("id", "recebidos", "rotulo", "Pagamentos Recebidos", "valor", "R$ 42.380,00", "icone", "cifrao",
                        "variacao", Map.of("valor", "15% em relação ao mês anterior", "tendencia", "sobe")),
                Map.of("id", "pagos", "rotulo", "Agendamentos Pagos", "valor", "842", "icone", "calendarioCheck",
                        "variacao", Map.of("valor", "8% em relação ao mês anterior", "tendencia", "sobe")),
                Map.of("id", "pendentes", "rotulo", "Pendentes", "valor", "R$ 6.370,00", "icone", "relogio", "tom", "amarelo",
                        "variacao", Map.of("valor", "3% do total", "tendencia", "alerta"))
        ));

        Map<String, Object> evolucaoFinanceira = new LinkedHashMap<>();
        evolucaoFinanceira.put("escalaMaxima", 10000);
        evolucaoFinanceira.put("passo", 2000);
        evolucaoFinanceira.put("rotulos", List.of("09/09", "10/09", "11/09", "12/09", "13/09", "14/09", "15/09"));
        evolucaoFinanceira.put("series", List.of(
                Map.of("id", "receita", "rotulo", "Receita", "cor", "#0066FF",
                        "valores", List.of(4300, 3900, 5100, 5000, 3950, 4900, 4850)),
                Map.of("id", "pagamento", "rotulo", "Pagamento", "cor", "#7FB2FF",
                        "valores", List.of(2600, 2250, 3400, 2700, 2200, 3100, 3350))
        ));
        response.put("evolucaoFinanceira", evolucaoFinanceira);

        Map<String, Object> formasPagamento = new LinkedHashMap<>();
        formasPagamento.put("total", "R$ 42.380,00");
        formasPagamento.put("descricao", "Total recebido");
        formasPagamento.put("fatias", List.of(
                Map.of("id", "credito", "rotulo", "Cartão de Crédito", "percentual", 45, "cor", "#5B9BFF"),
                Map.of("id", "pix", "rotulo", "Pix", "percentual", 30, "cor", "#14B8A6"),
                Map.of("id", "boleto", "rotulo", "Boleto", "percentual", 15, "cor", "#0066FF"),
                Map.of("id", "dinheiro", "rotulo", "Dinheiro", "percentual", 7, "cor", "#F59E0B"),
                Map.of("id", "outros", "rotulo", "Outros", "percentual", 3, "cor", "#A855F7")
        ));
        response.put("formasPagamento", formasPagamento);

        response.put("transacoes", List.of(
                Map.of("id", 1, "dataHora", "15/09/2026 10:24", "descricao", "Consulta médica", "paciente", "Maria Silva", "forma", "Pix", "valor", "R$ 120,00", "status", "pago"),
                Map.of("id", 2, "dataHora", "15/09/2026 09:50", "descricao", "Exame laboratorial", "paciente", "João Santos", "forma", "Cartão de Crédito", "valor", "R$ 85,00", "status", "pago"),
                Map.of("id", 3, "dataHora", "14/09/2026 16:32", "descricao", "Consulta médica", "paciente", "Ana Costa", "forma", "Boleto", "valor", "R$ 150,00", "status", "pago"),
                Map.of("id", 4, "dataHora", "14/09/2026 14:10", "descricao", "Retorno", "paciente", "Carlos Oliveira", "forma", "Pix", "valor", "R$ 90,00", "status", "pago"),
                Map.of("id", 5, "dataHora", "14/09/2026 11:47", "descricao", "Consulta médica", "paciente", "Juliana Pereira", "forma", "Dinheiro", "valor", "R$ 100,00", "status", "pago"),
                Map.of("id", 6, "dataHora", "13/09/2026 15:05", "descricao", "Exame de imagem", "paciente", "Roberto Almeida", "forma", "Cartão de Crédito", "valor", "R$ 240,00", "status", "pendente"),
                Map.of("id", 7, "dataHora", "13/09/2026 09:12", "descricao", "Consulta médica", "paciente", "Fernanda Rocha", "forma", "Pix", "valor", "R$ 120,00", "status", "pago"),
                Map.of("id", 8, "dataHora", "12/09/2026 17:40", "descricao", "Exame laboratorial", "paciente", "Lucas Almeida", "forma", "Boleto", "valor", "R$ 85,00", "status", "estornado")
        ));

        Map<String, Object> statusTransacao = new LinkedHashMap<>();
        statusTransacao.put("pago", Map.of("rotulo", "Pago", "variante", "sucesso"));
        statusTransacao.put("pendente", Map.of("rotulo", "Pendente", "variante", "aviso"));
        statusTransacao.put("estornado", Map.of("rotulo", "Estornado", "variante", "erro"));
        response.put("statusTransacao", statusTransacao);

        response.put("acoesRapidas", List.of(
                Map.of("id", "relatorio", "titulo", "Gerar Relatório Financeiro", "descricao", "Baixe relatórios em PDF ou Excel.", "icone", "documento"),
                Map.of("id", "convenios", "titulo", "Gerenciar Convênios", "descricao", "Configure e acompanhe os convênios ativos.", "icone", "aperto"),
                Map.of("id", "formas", "titulo", "Configurar Formas de Pagamento", "descricao", "Ative ou desative métodos de pagamento.", "icone", "cartao"),
                Map.of("id", "nota", "titulo", "Emitir Nota Fiscal", "descricao", "Gere notas fiscais dos atendimentos.", "icone", "documento")
        ));

        response.put("opcoesPeriodoFinanceiro", List.of(
                Map.of("valor", "7d", "rotulo", "Últimos 7 dias"),
                Map.of("valor", "15d", "rotulo", "Últimos 15 dias"),
                Map.of("valor", "30d", "rotulo", "Últimos 30 dias")
        ));

        return ResponseEntity.ok(response);
    }
}
