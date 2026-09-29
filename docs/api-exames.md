# API — Exames

Ciclo de um exame, do pedido ao resultado:

```
médico pede ─► solicitado ─► clínica marca a coleta ─► agendado ─► em_analise ─► liberado
                    │                                      │            │
                    └──────────────── cancelado ◄──────────┴────────────┘
```

A clínica pode liberar o resultado a partir de `solicitado`, `agendado` ou
`em_analise` (laboratório externo, por exemplo) e pode enviar de novo um
resultado já liberado (correção de laudo: o arquivo anterior é apagado
depois do commit). Exame `liberado` não pode ser cancelado; `cancelado` não
recebe resultado (`422`).

Implementação em `backend/src/main/java/br/com/saudeplus/exames/`
(`ExamesService`) e `arquivos/`.

## Médico (`/api/medico`, papel `MEDICO`)

| Rota | Faz |
| --- | --- |
| `POST /api/medico/exames` | `{ "pacienteId", "tipoExameId", "prazo"?, "agendamentoOrigemId"? }` → `201` |
| `GET /api/medico/exames-pendentes` | pedidos deste médico ainda sem resultado |
| `GET /api/medico/exames/{id}/resultado` | arquivo do resultado de um exame que este médico pediu |

- Só para pacientes do médico (com consulta, passada ou futura, com ele); os
  demais respondem `404`, como se não existissem. Tipo inexistente também `404`.
- `prazo` é a data-limite para o resultado; data passada responde `400`.
- `agendamentoOrigemId`, se vier, precisa ser consulta deste médico com este
  paciente (`422`).

## Clínica (`/api/admin/exames`, papel `ADMIN`)

| Rota | Faz |
| --- | --- |
| `GET /api/admin/exames?status=` | fila, pedidos mais antigos primeiro |
| `PATCH /api/admin/exames/{id}/agendamento` | `{ "dataHora": "2026-10-05T07:30", "unidadeId" }` (horário local, no futuro, unidade ativa) |
| `PATCH /api/admin/exames/{id}/em-analise` | coleta feita, aguardando resultado |
| `PATCH /api/admin/exames/{id}/cancelar` | cancela |
| `POST /api/admin/exames/{id}/resultado` | `multipart/form-data`, campo `arquivo` → libera o resultado |

Item da fila:

```json
{ "id": "…", "nome": "Hemograma completo", "categoria": "Exame de sangue",
  "pacienteId": "…", "paciente": "Ana Paula Ferreira", "medico": "Dr. Carlos Andrade",
  "status": "agendado", "dataHora": "2026-10-05T07:30:00", "unidade": "Clínica da Família – Centro",
  "prazo": "2026-10-10", "solicitadoEm": "2026-09-28T15:02:11Z", "resultadoLiberadoEm": null }
```

### Arquivo do resultado

- Aceita **PDF, PNG ou JPEG até 10 MB**. O formato é conferido pelos primeiros
  bytes do arquivo, não pela extensão nem pelo `Content-Type` enviado: um HTML
  renomeado para `.pdf` é recusado (`400`, `campos.arquivo`). Acima de 10 MB, `413`.
- O arquivo é guardado com nome gerado (`<uuid>.pdf`), nunca com o nome
  enviado, em `saudeplus.arquivos.dir` (variável `ARQUIVOS_DIR`; no perfil dev,
  `backend/dados/arquivos/`, fora do git). A interface `ArmazenamentoArquivos`
  permite trocar o disco por um bucket.

## Paciente (`/api/paciente`, papel `PACIENTE`)

| Rota | Faz |
| --- | --- |
| `GET /api/paciente/exames?status=` | exames do paciente, com `preparo` e `resultadoDisponivel` |
| `GET /api/paciente/exames/{id}` | um exame |
| `GET /api/paciente/exames/{id}/resultado` | arquivo do resultado |

Resultado ainda não liberado, ou exame de outra pessoa: `404`.

## Download

As rotas `…/resultado` respondem o arquivo com:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="resultado-hemograma-completo.pdf"
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

Como exigem o token, o front não usa `<a href>`: `baixarArquivo` em
`frontend/src/services/http.js` busca com `Authorization` e entrega ao
navegador como blob.

## Catálogo

`GET /api/publico/tipos-exame` (sem login): `[{ id, nome, categoria, preparo, prazoResultadoDias }]`.

## Notificações automáticas

| Evento | Quem recebe |
| --- | --- |
| médico pede | paciente ("Novo exame solicitado", com o preparo) |
| clínica marca a coleta | paciente ("Coleta de exame agendada", data e unidade) |
| clínica libera o resultado | paciente e médico que pediu ("Resultado de exame disponível") |
