# API — Financeiro e relatórios

Rotas das telas Financeiro e Relatórios da administração. Implementadas em
`backend/src/main/java/br/com/saudeplus/financeiro/` e
`admin/FinanceiroERelatoriosController.java` (+ `RelatoriosService`); chamadas
por `frontend/src/features/admin/admin.api.js`.

Acesso: `/api/admin/financeiro/**` pertence ao módulo `financeiro` e
`/api/admin/relatorios/**` ao módulo `relatorios` da matriz de permissões (ver
[api-admin.md](api-admin.md)). Valores em dinheiro saem como número
(`150.00`); o front formata.

## Cobranças

Uma transação (`transacoes`) é uma cobrança ao paciente. Status:

| Status | Significa | Vai para |
| --- | --- | --- |
| `pendente` | lançada, ainda não paga | `pago`, `estornado` |
| `pago` | recebida (`pagoEm` registrado) | `estornado` |
| `estornado` | anulada (se estava pendente) ou devolvida (se estava paga) | — |

Formas: `credito`, `debito`, `pix`, `boleto`, `dinheiro`, `convenio`. A forma é
opcional enquanto pendente e obrigatória para dar baixa (exceto quando já é `convenio`).

Automático (`financeiro/CobrancaDeConsultas`, depois do commit):

- agendamento **confirmado** → cobrança `pendente` com o `valorConsulta` do
  médico. Médico sem valor cadastrado não gera cobrança. Paciente com convênio
  aceito pelo médico → forma `convenio`.
- agendamento **cancelado** → cobranças pendentes dele viram `estornado`.
  Cobranças já pagas não são tocadas: a devolução é manual.

Não há gateway de pagamento: a baixa (`pago`) e o estorno são feitos pela administração.

## Financeiro (`financeiro`)

| Rota | Faz |
| --- | --- |
| `GET /api/admin/financeiro/transacoes?de=&ate=&status=&forma=&q=&pagina=&tamanho=` | `Pagina` de transações lançadas no período, mais recentes primeiro. `q` busca por paciente ou descrição. Padrão: 50 por página |
| `GET /api/admin/financeiro/resumo?de=&ate=` | números do período (abaixo). Sem datas: últimos 7 dias |
| `POST /api/admin/financeiro/transacoes` | lançamento manual → `201` |
| `PATCH /api/admin/financeiro/transacoes/{id}/status` | `{ "status": "pago", "forma": "pix" }` dá baixa; `{ "status": "estornado" }` estorna. Transição inválida → `422` |
| `GET /api/admin/financeiro/exportar?de=&ate=&status=&formato=` | arquivo com as transações do período |

Transação:

```json
{
  "id": "…", "dataHora": "2026-09-28T13:00:00Z", "pagoEm": null, "estornadoEm": null,
  "paciente": { "id": "…", "nome": "Ana Souza", "cpf": "123.456.789-09" },
  "agendamentoId": "…", "descricao": "Consulta – Cardiologia – Dr. Carlos Andrade",
  "forma": null, "valor": 150.00, "status": "pendente"
}
```

Lançamento manual: `{ "pacienteId", "agendamentoId"?, "descricao", "valor", "forma"?, "jaPago"? }`
(`jaPago: true` exige `forma`).

Resumo:

```json
{
  "de": "2026-09-22", "ate": "2026-09-28",
  "faturado": { "atual": 1800.00, "anterior": 1200.00 },
  "recebido": { "atual": 600.00, "anterior": 450.00 },
  "pagamentos": { "atual": 4, "anterior": 3 },
  "consultasPagas": { "atual": 4, "anterior": 3 },
  "emAberto": 1200.00, "cobrancasEmAberto": 8,
  "estornado": 0.00,
  "porForma": [ { "forma": "pix", "rotulo": "Pix", "total": 300.00, "percentual": 50 } ],
  "evolucao": [ { "data": "2026-09-22", "faturado": 0.00, "recebido": 0.00 } ]
}
```

- `faturado`: cobranças lançadas no período, sem as anuladas.
- `recebido`, `pagamentos`, `porForma`: pela data do pagamento.
- `anterior`: período de mesmo tamanho logo antes.
- `emAberto`: tudo o que está pendente hoje, de qualquer data.
- `evolucao`: um ponto por dia.

## Relatórios (`relatorios`)

Filtros comuns: `de`, `ate` (padrão: últimos 30 dias; até 366 dias),
`status` (status de agendamento), `unidadeId`, `medicoId`, `especialidadeId`.

| Rota | Faz |
| --- | --- |
| `GET /api/admin/relatorios/resumo?…` | indicadores e gráficos (abaixo) |
| `GET /api/admin/relatorios/exportar?tipo=&formato=&…` | arquivo do relatório. `tipo` desconhecido → `404` |

Resumo:

- `totais` e `anterior`: `{ agendamentos, atendimentos, pacientes, cancelamentos, faltas }`
  do período e do período anterior de mesmo tamanho. `atendimentos` são os `realizada`;
  `pacientes`, os distintos.
- `porTipo`: `{ consultas, retornos, exames }` (exames = agendamentos de exame + exames pedidos no período).
- `porEspecialidade`, `porUnidade`, `porProfissional`: `[{ rotulo, total }]`, do maior para o menor.
- `evolucao`: `[{ rotulo, periodo, total }]`, por dia até 62 dias, senão por mês.
- `faixaEtaria`: `[{ rotulo, total }]` nas faixas 0–18, 19–30, 31–50, 51–70, +70 e "Não informada".

Cancelados ficam fora dos gráficos, mas entram em `totais.cancelamentos`.

Tipos de exportação:

| `tipo` | Colunas |
| --- | --- |
| `agendamentos` | Data, Hora, Paciente, CPF, Especialidade, Profissional, Unidade, Tipo, Status |
| `atendimentos` | Data, Hora, Paciente, Especialidade, Profissional, Unidade, Desfecho |
| `cancelamentos` | Data, Hora, Paciente, Profissional, Unidade, Status, Motivo |
| `pacientes` | Paciente, CPF, Idade, Telefone, Agendamentos, Atendimentos, Última consulta |

O financeiro exporta: Lançado em, Paciente, CPF, Descrição, Forma, Valor, Status, Pago em.

## Formatos de arquivo

`formato`: `pdf`, `csv` ou `excel`. Sem ele, `csv`.

- **CSV** no padrão do Excel brasileiro: UTF-8 com BOM, `;` como separador e
  valores em reais formatados (`R$ 150,00`). `excel` também gera CSV (abre direto no Excel); não há `.xlsx`.
- Células que começam com `=`, `+`, `-` ou `@` ganham um `'` na frente, para o
  Excel não executar como fórmula.
- **PDF** (OpenPDF), em paisagem, com título, período e a tabela.

O nome do arquivo vem em `Content-Disposition` (`relatorio-de-pacientes.csv`).
Toda exportação é registrada na auditoria (`relatorio.exportar`), assim como
`financeiro.lancar` e `financeiro.status`.

## Paciente

`GET /api/paciente/pagamentos`: cobranças e pagamentos do paciente logado, no
formato de transação acima, mais recentes primeiro (ver [api-area-paciente.md](api-area-paciente.md)).

## No front

- `features/admin/pages/AdminConectado.jsx`: `FinanceiroDoAdmin` e
  `RelatoriosDoAdmin`. O seletor de período do topo refaz a consulta.
- Financeiro: a ação rápida "Gerar Relatório Financeiro" baixa o PDF do período;
  as demais ações rápidas ainda não existem.
- Relatórios: cada cartão "Gerar" baixa o relatório do período do topo no
  formato escolhido nos filtros; "Gerar relatório personalizado" baixa o de
  agendamentos com os filtros avançados (profissional, unidade, especialidade e
  status vêm da API). O cartão "Tempo médio de espera" fica em "—": não há
  registro do horário de chegada para calcular.
- Os downloads usam `baixarArquivo` (`services/http.js`), que manda o token.
