# API — Área do Paciente

Rotas que servem as telas do paciente (`/paciente/*` no front). Implementadas
em `backend/src/main/java/br/com/saudeplus/areapaciente/` e chamadas por
`frontend/src/features/paciente/paciente.api.js`.

Todas exigem `Authorization: Bearer <token>` de um usuário com papel
`PACIENTE` (ver [api.md](api.md)). **O paciente vem do token**: nenhuma rota
recebe o id dele. Consulta ou exame de outra pessoa responde `404`, como se
não existisse.

Datas em ISO, horários em `HH:mm` (locais da unidade), ids UUID. Status de
consulta: ver a tabela em [api-painel-medico.md](api-painel-medico.md#status-de-consulta).

## Consulta

Formato de toda consulta devolvida por estas rotas:

```json
{
  "id": "…",
  "data": "2026-09-30",
  "horario": "08:00",
  "inicio": "2026-09-30T08:00:00",
  "especialidade": { "id": "…", "nome": "Clínico Geral" },
  "medico": { "id": "…", "nome": "Dr. Carlos Andrade" },
  "unidade": { "id": "…", "nome": "Clínica da Família – Centro",
               "endereco": "Rua das Flores, 123 – Centro, Saquarema - RJ",
               "telefone": "(22) 2655-1234", "horarioFuncionamento": "…", "mapUrl": "…" },
  "tipo": "consulta",
  "modalidade": "presencial",
  "status": "pendente",
  "motivo": "Check-up",
  "motivoCancelamento": null,
  "podeAlterar": true
}
```

`podeAlterar` diz se cancelar e remarcar estão liberados: a consulta está
`pendente` ou `confirmada` e falta mais que a antecedência mínima
(`saudeplus.agenda.antecedencia-cancelamento`, padrão 24 h).

## Endpoints

| Rota | Faz |
| --- | --- |
| `GET /api/paciente/painel` | `{ paciente {id, nome, fotoUrl, iniciais}, proximasConsultas[] (até 3), unidade (da próxima, ou null), notificacoesNaoLidas }` |
| `GET /api/paciente/agendamentos?situacao=&status=` | consultas; `situacao` = `futuras` (mais próxima primeiro) ou `passadas` (mais recente primeiro); sem ela, todas |
| `POST /api/paciente/agendamentos` | reserva (abaixo) → `201` com a consulta |
| `PATCH /api/paciente/agendamentos/{id}/cancelar` | `{ "motivo": "…" }` opcional → a consulta, `cancelada` |
| `PATCH /api/paciente/agendamentos/{id}/remarcar` | `{ "data", "horario", "modalidade"? }` → a consulta no novo horário, de volta a `pendente` |
| `GET /api/paciente/historico` | consultas realizadas, mais recente primeiro: `{ id, inicio, especialidade, medico, unidade, resumo, desfecho, avaliacao }` (`avaliacao` = nota dada, ou null) |
| `POST /api/paciente/avaliacoes` | `{ "agendamentoId", "nota": 1–5, "comentario"? }` → `201` |
| `GET /api/paciente/exames?status=` | exames: `{ id, nome, categoria, preparo, status, dataHora, prazo, medico, unidade, resultadoDisponivel }` |
| `GET /api/paciente/exames/{id}` | um exame |
| `GET /api/paciente/exames/{id}/resultado` | arquivo do resultado liberado (ver [api-exames.md](api-exames.md)) |
| `GET /api/paciente/pagamentos` | cobranças e pagamentos, mais recentes primeiro (formato em [api-financeiro-relatorios.md](api-financeiro-relatorios.md)) |
| `GET /api/paciente/notificacoes` | as 30 mais recentes |
| `PATCH /api/paciente/notificacoes/{id}/lida` | marca uma como lida |
| `PATCH /api/paciente/notificacoes/lidas` | marca todas como lidas → `204` |

### Reservar

```json
{ "medicoId": "…", "especialidadeId": "…", "data": "2026-09-30", "horario": "08:00",
  "modalidade": "presencial", "motivo": "Check-up" }
```

O front monta a escolha com as rotas públicas: especialidades
(`/api/publico/especialidades`), médicos da especialidade
(`/api/publico/profissionais?especialidade=`) e horários livres
(`/api/publico/profissionais/{id}/horarios?de=&ate=`). A unidade sai do próprio
horário escolhido; `modalidade` só é preciso quando o mesmo horário é oferecido
em mais de uma.

| Resposta | Quando |
| --- | --- |
| `201` | reservada; fica `pendente` até o médico ou a clínica confirmar |
| `400` | campo obrigatório faltando (`campos`) |
| `404` | médico inexistente ou com conta inativa |
| `409` | horário não está entre os livres (tomado, fora da agenda, perto demais), ou o paciente já tem consulta nesse horário |
| `422` | o médico não atende nessa especialidade |

Duas reservas simultâneas no mesmo horário: o índice único do banco deixa só
uma passar; a outra recebe `409`.

### Cancelar e remarcar

Só consultas `pendente` ou `confirmada`, com a antecedência mínima; fora disso,
`422` com a mensagem pronta para exibir. Remarcar segue as mesmas regras de
horário da reserva (`409` se o novo horário não está livre).

### Avaliar

Uma avaliação por consulta `realizada` do próprio paciente (`409` na segunda,
`422` se a consulta não foi realizada). A nota entra na média do médico, que
a busca e o perfil públicos mostram. As avaliações aparecem em
`GET /api/publico/profissionais/{id}/avaliacoes` com o autor abreviado
("Ana F."): o nome completo do paciente não é exposto.

## Notificações automáticas

Geradas depois do commit (`notificacoes/NotificacoesDeAgendamento`), sempre
para a outra parte:

| Evento | Quem recebe |
| --- | --- |
| paciente reserva | médico ("Novo agendamento") |
| paciente remarca | médico ("Consulta remarcada", com o horário antigo e o novo) |
| paciente cancela | médico ("Consulta cancelada pelo paciente") |
| médico cancela ou bloqueia a agenda | paciente ("Consulta cancelada", com o motivo) |

## No front

- `features/paciente/pages/PacienteConectado.jsx`: as telas ligadas à API; sem
  API, usam os mocks de `services/dadosficticios.js` e mostram a faixa de
  demonstração, e as ações (agendar, cancelar, remarcar, avaliar) ficam desligadas.
- `features/paciente/adaptadores.js`: converte as respostas para o formato que
  as telas já recebiam.
- `components/ModalAgendamento.jsx`: opções reais via
  `features/paciente/useOpcoesDeAgendamento.js`; espera a resposta da reserva e,
  com `409`, mostra o erro e recarrega os horários. Com `fixo`, vira o modal de
  remarcar; com `inicial`, abre já preenchido.
- `/paciente/consultas?agendar=<medicoId>&data=&horario=`: destino do "Agendar
  consulta" do perfil público e da busca. A página descobre a especialidade do
  médico (`GET /api/publico/profissionais/{id}`) e abre o modal com médico, dia
  e horário escolhidos; tudo continua editável.
- `pages/ExamesPage.jsx`: com `aoBaixarResultado`, exames liberados ganham o
  botão "Baixar resultado", que baixa o arquivo com o token (`baixarArquivo`).
