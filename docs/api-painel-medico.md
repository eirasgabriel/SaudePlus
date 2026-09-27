# API — Painel do Médico

Primeiros endpoints reais do SaúdePlus, na branch `feature/dashboard-medico`.
Servem a tela do profissional de saúde.

Conforme combinado, esta entrega **não tem banco de dados e não tem
autenticação**: os dados vivem em memória e todos os endpoints são abertos.
O `docs/api.md` continua descrevendo o estado anterior e precisa de um
ponteiro para cá quando a equipe achar melhor.

## Como rodar

```powershell
# back-end (porta 8080)
cd backend
.\mvnw.cmd spring-boot:run

# front-end, em outro terminal
cd frontend
copy .env.example .env
npm install
npm run dev
```

Depois abra `http://localhost:5173/medico` (depois de entrar com uma conta de médico). **Com o back-end fora do ar a
tela continua funcionando**: cai nos mocks locais e mostra uma faixa avisando
que os dados são de demonstração.

No Linux/macOS, use `sh ./mvnw spring-boot:run` e `cp .env.example .env`.

## Convenções

- Base: `http://localhost:8080`, prefixo `/api`.
- Tudo em JSON, UTF-8.
- Datas em ISO (`2026-09-15`); horários em `HH:mm`.
- CORS liberado para `http://localhost:5173`; configurável por
  `saudeplus.cors.origens`.
- Enquanto não há login, o identificador do profissional vai na URL. Quando a
  autenticação entrar, ele sai do caminho e vem do token.

### Status de consulta

| Chave | Rótulo | Conta como atendida | Conta como próxima |
| --- | --- | --- | --- |
| `realizada` | Realizada | sim | não |
| `em_andamento` | Em andamento | não | não |
| `aguardando` | Aguardando | não | sim |
| `confirmada` | Confirmada | não | sim |

A consulta em andamento não entra em nenhum dos dois contadores: já começou,
mas ainda não terminou.

### Formato de erro

Toda falha sai no mesmo formato, para o cliente não precisar adivinhar:

```json
{
  "momento": "2026-09-17T22:45:12.331-03:00",
  "status": 404,
  "erro": "Not Found",
  "mensagem": "Médico não encontrado: med-9",
  "caminho": "/api/medicos/med-9/painel",
  "campos": []
}
```

`campos` só é preenchido em erro de validação (422), com `campo` e `mensagem`
de cada um. Nos demais casos vai como lista vazia, nunca ausente.

| Código | Quando |
| --- | --- |
| 400 | parâmetro mal formado (status desconhecido, data inválida) |
| 404 | recurso inexistente |
| 422 | corpo válido em forma, mas que viola uma regra ou validação |

## Endpoints

### `GET /api/medicos/{medicoId}/painel`

Tudo o que a tela precisa, numa requisição. Parâmetro opcional `data`; omitido,
usa o dia de referência da carga de demonstração.

```json
{
  "medico": { "id": "med-1", "nome": "Dr. Carlos Mendes", "perfil": "Médico",
              "especialidade": "Clínico Geral", "crm": "CRM 123.456-RJ", "avatarUrl": null },
  "unidade": { "id": "uni-1", "nome": "Clínica da Família – Centro", "cidade": "Saquarema",
               "endereco": "Rua das Flores, 123 – Saquarema, RJ", "telefone": "(22) 2655-1234",
               "horario": "Segunda a Sexta - 07h às 17h", "mapUrl": "#" },
  "dataReferencia": "2026-09-15",
  "fraseDoDia": "Cuidar de pessoas é o que nos move todos os dias.",
  "resumo": { "consultasHoje": 8, "pacientesAtendidos": 3, "examesPendentes": 3,
              "proximasConsultas": 4, "primeiroHorarioPendente": "10:40" },
  "contagemPorStatus": { "realizada": 3, "em_andamento": 1, "aguardando": 2, "confirmada": 2 },
  "agenda": [ { "id": "ag-1", "horario": "08:00", "pacienteId": "ana-paula-ferreira",
                "paciente": "Ana Paula Ferreira", "tipo": "Consulta de rotina", "status": "realizada" } ],
  "pacientes": [ { "id": "ana-paula-ferreira", "nome": "Ana Paula Ferreira", "idade": 32,
                   "motivo": "Consulta de rotina", "iniciais": "AF" } ],
  "examesPendentes": [ { "id": "ex-1", "nome": "Hemograma completo", "pacienteId": "joao-gabriel-santos",
                         "paciente": "João Gabriel Santos", "prazo": "Hoje" } ],
  "notificacoes": [ { "id": "nt-1", "tipo": "resultado", "titulo": "Resultado de exame disponível",
                      "detalhe": "Mariana Costa – Ultrassom abdominal", "quando": "Hoje, 09:15", "lida": false } ]
}
```

`pacientes` vem cortado em 5, que é o que o painel mostra antes do "Ver todos".
`primeiroHorarioPendente` vem `null` quando não há mais consultas no dia.

### `GET /api/medicos/{medicoId}/agenda`

Parâmetros: `data` (ISO) e `status` (chave do domínio, ou `todas`). Um status
desconhecido devolve 400 em vez de ignorar o filtro em silêncio e mostrar a
agenda inteira. Responde a lista de consultas, ordenada por horário.

### `PATCH /api/agendamentos/{consultaId}/status`

```json
{ "status": "realizada" }
```

Devolve a consulta atualizada. `status` ausente devolve 422 apontando o campo;
consulta inexistente devolve 404. **Sem banco, a alteração vale enquanto a
aplicação estiver de pé** e volta ao estado inicial no próximo restart.

### Demais endpoints

| Método e caminho | Devolve |
| --- | --- |
| `GET /api/medicos/{medicoId}` | dados do profissional |
| `GET /api/medicos/{medicoId}/pacientes?limite=` | pacientes; sem `limite`, todos |
| `GET /api/medicos/{medicoId}/exames-pendentes` | exames aguardando resultado |
| `GET /api/medicos/{medicoId}/notificacoes` | notificações do profissional |
| `GET /api/pacientes/{pacienteId}` | um paciente |
| `GET /api/clinicas/{unidadeId}` | uma unidade |

## Organização do back-end

Segue as camadas do `docs/arquitetura.md`: o controller recebe HTTP, o service
concentra as regras, o repository acessa a persistência e os DTOs definem o
contrato. Nenhum domínio expõe o record de domínio direto na resposta.

```text
br.com.saudeplus
├── config/CorsConfig.java
├── dados/DadosDemonstracao.java        carga em memória
├── exception/                          exceções + @RestControllerAdvice
├── agendamentos/  Consulta, StatusConsulta, AgendaService, AgendaController
├── pacientes/     Paciente, PacienteService, PacienteController
├── profissionais/ Medico, MedicoService, MedicoController
├── clinicas/      Unidade, UnidadeService, UnidadeController
├── exames/        Exame, ExameService, ExameController
├── notificacoes/  Notificacao, TipoNotificacao, NotificacaoService, ...
└── painel/        PainelMedicoService, PainelMedicoController
```

`pacientes`, `notificacoes` e `painel` são pacotes novos: a arquitetura previa
`auth`, `profissionais`, `clinicas`, `exames` e `agendamentos`, que não cobrem
esses três domínios. `auth` e `security` seguem vazios, como combinado.

Cada repositório é uma interface com uma implementação `...EmMemoriaRepository`.
Trocar por JPA depois é substituir a implementação, sem tocar nos services.

### Sem banco, o que isso significa

Os dados são os mesmos de `frontend/src/features/medico/data/medico.js`, de
propósito: a tela fica idêntica consumindo a API ou os mocks. As listas são
imutáveis, exceto as consultas, que ficam num `ConcurrentHashMap` porque o
PATCH as altera. Quando o banco entrar, `DadosDemonstracao` vira uma migration
de seed e os repositórios em memória saem junto.

## Ligação com o front-end

- `src/services/http.js` — wrapper de `fetch` com base configurável, timeout de
  8s, cancelamento e `ErroDeApi` (com `offline` para distinguir "o servidor
  recusou" de "o servidor não respondeu").
- `src/features/medico/medico.api.js` — uma função por endpoint.
- `src/features/medico/usePainelMedico.js` — carrega o painel e devolve
  `origem: "carregando" | "api" | "mocks"`.
- `src/features/medico/pages/PainelMedicoConectado.jsx` — escolhe a fonte;
  `DashboardMedico` continua sendo apresentação pura.

Os contadores existem dos dois lados: `AgendaService`/`PainelMedicoService` no
servidor e `selectors.js` no cliente. Não é duplicação por descuido — a tela
precisa recalcular ao filtrar sem ir ao servidor. As duas implementações são
cobertas por testes que fixam os mesmos números.

## Testes

Back-end, em `backend/src/test/java/br/com/saudeplus`:

- `PacienteTest` — regra das iniciais.
- `StatusConsultaTest` — chaves do contrato, `concluida` e `pendente`.
- `AgendaServiceTest` — ordenação, filtro, contadores, troca de status, 404.
- `PainelMedicoServiceTest` — montagem do painel e contadores derivados.
- `PainelMedicoApiTest` — API de ponta a ponta com MockMvc, incluindo os
  formatos de erro.

```powershell
cd backend
.\mvnw.cmd test
```

Front-end: `cd frontend && npm test`.
