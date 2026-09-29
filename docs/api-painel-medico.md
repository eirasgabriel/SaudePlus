# API — Área do Médico

Rotas que servem a tela do profissional de saúde (`/medico` no front).
Implementadas em `backend/src/main/java/br/com/saudeplus/areamedico/` e
chamadas por `frontend/src/features/medico/medico.api.js`.

Todas exigem `Authorization: Bearer <token>` de um usuário com papel `MEDICO`
(ver [api.md](api.md)). **O médico vem do token**: nenhuma rota recebe o id
dele. Consulta, paciente, janela, bloqueio ou notificação de outro médico
responde `404`, como se não existisse. Uma conta `MEDICO` sem perfil
profissional (CRM) responde `403`.

## Como rodar

```powershell
# back-end (porta 8080; sobe o Postgres pelo Docker)
cd backend
.\mvnw.cmd spring-boot:run

# front-end, em outro terminal
cd frontend
copy .env.example .env
npm install
npm run dev
```

Entre em `http://localhost:5173/login` com `medico@saudeplus.com` /
`Medico@SaudePlus2026`. No perfil `dev`, a cada subida o servidor garante uma
agenda de demonstração para o dia de hoje (`demo/AgendaDeDemonstracao`). Com o
back-end fora do ar, a tela cai nos mocks locais e mostra uma faixa avisando.

## Convenções

- Datas em ISO (`2026-09-15`); horários em `HH:mm`, locais da unidade
  (fuso `America/Sao_Paulo`).
- Ids são UUID.
- Erros no formato de [api.md](api.md#formato-de-erro).

### Status de consulta

Um único conjunto, compartilhado com paciente e admin. A chave é o que trafega:

| Chave | Rótulo | Pode ir para |
| --- | --- | --- |
| `pendente` | Pendente | `confirmada`, `cancelada` |
| `confirmada` | Confirmada | `aguardando`, `cancelada`, `faltou` |
| `aguardando` | Aguardando (check-in feito) | `em_andamento` |
| `em_andamento` | Em andamento | `realizada` |
| `realizada` | Realizada | — |
| `cancelada` | Cancelada | — |
| `faltou` | Não compareceu | — |

Transição fora da tabela responde `422`. `cancelada` e `faltou` liberam o
horário para outra reserva. "Retorno" não é status: é o tipo de atendimento
(`consulta`, `retorno`, `exame`).

## Endpoints

### `GET /api/medico/painel?data=`

A tela inicial numa requisição só. Sem `data`, usa hoje.

```json
{
  "medico": { "id": "…", "nome": "Dr. Carlos Andrade", "perfil": "Médico",
              "especialidade": "Clínico Geral", "crm": "CRM 112.233-RJ", "avatarUrl": null },
  "unidade": { "id": "…", "nome": "Clínica da Família – Centro", "cidade": "Saquarema",
               "endereco": "Rua das Flores, 123 – Centro, Saquarema - RJ", "telefone": "(22) 2655-1234",
               "horario": "Segunda a sexta, 07h às 17h", "mapUrl": "https://…" },
  "dataReferencia": "2026-09-28",
  "fraseDoDia": "Cuidar de pessoas é o que nos move todos os dias.",
  "resumo": { "consultasHoje": 8, "pacientesAtendidos": 3, "examesPendentes": 3,
              "proximasConsultas": 4, "primeiroHorarioPendente": "10:40" },
  "contagemPorStatus": { "pendente": 0, "confirmada": 2, "aguardando": 2, "em_andamento": 1,
                         "realizada": 3, "cancelada": 0, "faltou": 0 },
  "agenda": [{ "id": "…", "horario": "08:00", "pacienteId": "…", "paciente": "Ana Paula Ferreira",
               "tipo": "Consulta de rotina", "tipoAtendimento": "consulta", "modalidade": "presencial",
               "status": "realizada" }],
  "pacientes": [{ "id": "…", "nome": "Lucas Martins", "idade": 24, "motivo": "Consulta clínica geral",
                  "iniciais": "LM", "ultimaConsulta": "2026-09-28" }],
  "examesPendentes": [{ "id": "…", "nome": "Hemograma completo", "pacienteId": "…",
                        "paciente": "João Gabriel Santos", "prazo": "Hoje", "prazoData": "2026-09-28",
                        "status": "solicitado" }],
  "notificacoes": [{ "id": "…", "tipo": "retorno", "titulo": "Lembrete de retorno", "detalhe": "…",
                     "quando": "Hoje, 09:15", "criadaEm": "2026-09-28T12:15:00Z", "lida": false }]
}
```

- `unidade` é `null` se o médico ainda não foi vinculado a nenhuma unidade.
- `resumo.consultasHoje` não conta canceladas. `proximasConsultas` são as
  `pendente`, `confirmada` e `aguardando`.
- `pacientes` são os 5 mais recentes (consultas até hoje). `idade` é `null`
  sem data de nascimento.
- `tipo` é o texto curto da lista: o motivo informado ou o tipo de atendimento.

### Agenda e consultas

| Rota | Faz |
| --- | --- |
| `GET /api/medico/agenda?data=&status=` | agenda de um dia (padrão: hoje); `status` é uma chave ou `todas` |
| `PATCH /api/medico/agendamentos/{id}/status` | `{ "status": "aguardando" }`; para `cancelada`, aceita `motivo` e avisa o paciente |
| `PATCH /api/medico/agendamentos/{id}/atendimento` | `{ "resumo": "…", "desfecho": "…" }`; encerra a consulta `em_andamento` como `realizada` (ou corrige uma já realizada) |

As duas `PATCH` devolvem a consulta atualizada, no formato de `agenda[]`.

### Pacientes e exames

| Rota | Faz |
| --- | --- |
| `GET /api/medico/pacientes?q=&pagina=&tamanho=` | pacientes com consulta com este médico, por nome (`Pagina<…>`) |
| `GET /api/medico/pacientes/{id}` | ficha: dados, histórico de consultas e exames **com este médico** |
| `GET /api/medico/exames-pendentes` | exames pedidos por este médico ainda sem resultado, prazo mais próximo primeiro |
| `POST /api/medico/exames` | pede um exame para um paciente seu (ver [api-exames.md](api-exames.md)) |
| `GET /api/medico/exames/{id}/resultado` | arquivo do resultado de um exame que este médico pediu |

### Configuração da agenda

Janelas semanais definem quando o médico atende; os horários livres que o
paciente vê são as janelas fatiadas pela duração, menos bloqueios, consultas
marcadas e o que começa em menos de 2 horas (`saudeplus.agenda.*`).

| Rota | Faz |
| --- | --- |
| `GET /api/medico/disponibilidades` | janelas do médico |
| `POST /api/medico/disponibilidades` | `{ "unidadeId", "diaSemana": 1, "inicio": "08:00", "fim": "12:00", "duracaoMin": 30, "modalidade": "presencial" }` → `201` |
| `PUT /api/medico/disponibilidades/{id}` | mesmo corpo |
| `DELETE /api/medico/disponibilidades/{id}` | `204`; consultas já marcadas não mudam |
| `GET /api/medico/bloqueios` | bloqueios que ainda não terminaram |
| `POST /api/medico/bloqueios?cancelarAgendamentos=` | `{ "inicio": "2026-10-01T08:00", "fim": "2026-10-01T12:00", "motivo": "Congresso" }` → `201` |
| `DELETE /api/medico/bloqueios/{id}` | `204` |

Regras:

- `diaSemana` segue a ISO: 1 = segunda, 7 = domingo.
- Janela só em unidade ativa onde o médico atende (`422`), sem sobrepor outra
  janela do mesmo dia (`409`), com `fim` depois de `inicio` e espaço para ao
  menos uma consulta (`400` com o campo).
- Bloqueio sobre consultas `pendente`/`confirmada` responde `422` até vir
  `?cancelarAgendamentos=true`: aí elas são canceladas, cada paciente recebe
  uma notificação e a resposta traz `agendamentosCancelados`. Paciente
  `aguardando` ou `em_andamento` no período sempre impede.

### Notificações

| Rota | Faz |
| --- | --- |
| `GET /api/medico/notificacoes` | as 30 mais recentes |
| `PATCH /api/medico/notificacoes/{id}/lida` | marca uma como lida |

## Horários públicos

`GET /api/publico/profissionais/{id}/horarios?de=&ate=` (sem login) devolve
`[{ "data", "horario", "duracaoMin", "unidadeId", "modalidade" }]`. Sem datas,
as próximas duas semanas; o fim é limitado a 60 dias à frente. A busca pública
usa o mesmo cálculo para `proximaData` e `proximosHorarios` de cada cartão.

## Organização do back-end

- `agendamentos/`: `Agendamento`, `StatusAgendamento` (transições) e o evento `AgendamentoCancelado`.
- `agenda/`: `Disponibilidade`, `BloqueioAgenda`, `CalculadoraDeHorarios` (função pura) e `AgendaService`.
- `areamedico/`: controller, services e DTOs de `/api/medico/*`. `MedicoLogado` resolve o médico pelo token.
- `exames/`, `notificacoes/`: entidades lidas pelo painel; o cancelamento vira notificação depois do commit.
- `demo/AgendaDeDemonstracao`: só no perfil `dev`.

## Testes

- `agenda/CalculadoraDeHorariosTest` e `agendamentos/StatusAgendamentoTest`: regras puras.
- `areamedico/AreaMedicoApiTest`: rotas de ponta a ponta, incluindo acesso de
  outro médico (`404`), transições (`422`), bloqueio com cancelamento e aviso ao paciente.
- `publico/PublicoApiTest`: horários públicos, inclusive que a hora gravada no
  banco chega à API sem deslocamento de fuso.
