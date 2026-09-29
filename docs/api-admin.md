# API — Administração

Rotas da área administrativa (`/admin` no front). Implementadas em
`backend/src/main/java/br/com/saudeplus/admin/`, `configuracoes/` e
`auditoria/`; chamadas por `frontend/src/features/admin/admin.api.js`.

Exames da clínica (fila, coleta, resultado) estão em [api-exames.md](api-exames.md);
financeiro e relatórios, em [api-financeiro-relatorios.md](api-financeiro-relatorios.md).

## Quem acessa

`/api/admin/**` é decidido por `security/AcessoAoAdmin`, a cada requisição:

| Papel | Acesso |
| --- | --- |
| `ADMIN` | tudo |
| `GESTOR`, `ENFERMEIRO`, `RECEPCIONISTA`, `AGENTE`, `MEDICO` | só os **módulos** liberados na matriz de permissões |
| `PACIENTE` | nada |

Cada rota pertence a um módulo:

| Módulo | Rotas |
| --- | --- |
| `dashboard` | `/api/admin/dashboard` |
| `usuarios` | `/api/admin/usuarios/**` |
| `clinicas` | `/api/admin/unidades/**`, `/especialidades/**`, `/convenios/**`, `/tipos-exame/**` |
| `agendamentos` | `/api/admin/agendamentos/**`, `/api/admin/exames/**` |
| `relatorios` | `/api/admin/relatorios/**` |
| `financeiro` | `/api/admin/financeiro/**` |
| `configuracoes` | `/api/admin/configuracoes/**` |
| — (só ADMIN) | `/api/admin/permissoes`, `/api/admin/auditoria` |

Matriz padrão (migração `V3`): gestor em dashboard, usuários, clínicas,
agendamentos e relatórios; enfermagem em dashboard, agendamentos e relatórios;
recepção em dashboard, agendamentos e relatórios; médico em nenhum (tem a área
própria). A administração muda pela tela de permissões.

`GET /api/auth/modulos` devolve os módulos de quem está logado
(`["dashboard", "agendamentos", ...]`); o front filtra o menu por ela. A equipe
entra em `/admin` pelo login, como o ADMIN.

## Usuários (`usuarios`)

| Rota | Faz |
| --- | --- |
| `GET /api/admin/usuarios?q=&papel=&status=&pagina=&tamanho=` | contas; `q` em nome, e-mail e CPF; até 500 por página |
| `GET /api/admin/usuarios/metricas` | `{ total, ativos, bloqueados, inativos, novosNoMes, novosNoMesAnterior }` |
| `GET /api/admin/usuarios/{id}` | uma conta |
| `POST /api/admin/usuarios` | cria a conta e envia o convite → `201` |
| `PUT /api/admin/usuarios/{id}` | `{ nomeCompleto, telefone, cpf, papel, medico? }` |
| `PATCH /api/admin/usuarios/{id}/status` | `{ "status": "ativo" \| "bloqueado" \| "inativo" }` |
| `POST /api/admin/usuarios/{id}/convite` | reenvia o link para definir a senha → `204` |

Criar:

```json
{ "nomeCompleto": "Dra. Helena Prado", "email": "helena@saudeplus.com", "telefone": "(22) 99999-0000",
  "cpf": "529.982.247-25", "papel": "MEDICO",
  "medico": { "crm": "123456", "crmUf": "RJ", "especialidadeIds": ["…"], "unidadeIds": ["…"],
              "valorConsulta": 200, "bio": "…" } }
```

- **Sem senha**: a conta nasce com uma senha aleatória inutilizável, e a pessoa
  recebe por e-mail (no log, sem SMTP) um link para definir a sua, válido por
  72 h (`saudeplus.redefinicao-senha.validade-convite`). Expirou: reenviar
  convite, ou "Esqueci minha senha".
- `medico` é obrigatório para `MEDICO` (`400`, `campos.medico`). `paciente:
  { dataNascimento }` é opcional para `PACIENTE`.
- CPF: com ou sem pontuação, dígitos verificadores conferidos (`400`,
  `campos.cpf`), guardado como `000.000.000-00`, único (`409`). E-mail e CRM+UF
  também únicos (`409`).

Regras contra escalada de privilégio:

- só um ADMIN cria, altera ou bloqueia uma conta ADMIN, ou dá esse papel (`403`);
- ninguém muda o próprio status ou o próprio papel (`422`);
- papel só troca entre papéis de equipe; médico e paciente têm perfis próprios
  e não viram outra coisa (`422`).

Bloquear derruba o token já emitido: a situação da conta é relida a cada requisição.

## Unidades e catálogos (`clinicas`)

| Rota | Faz |
| --- | --- |
| `GET /api/admin/unidades` | todas, inclusive fora de operação, com `especialidades` (dos médicos vinculados), `medicos` e `agendamentosNoMes` |
| `GET /api/admin/unidades/metricas` | `{ total, ativas, manutencao, inativas }` |
| `POST /api/admin/unidades` · `PUT /api/admin/unidades/{id}` | `{ nome, endereco, bairro, cidade, uf, telefone, horarioFuncionamento, mapUrl }` |
| `PATCH /api/admin/unidades/{id}/status` | `{ "status": "ativa" \| "manutencao" \| "inativa" }`; fora de `ativa`, some da busca e deixa de oferecer horários (consultas marcadas continuam) |
| `GET/POST /api/admin/especialidades` · `PUT …/{id}` | `{ nome, descricao }`; o slug sai do nome e não muda; nome repetido `409` |
| `GET/POST /api/admin/convenios` · `PUT …/{id}` | `{ nome, ativo }`; convênio inativo some da busca |
| `GET/POST /api/admin/tipos-exame` · `PUT …/{id}` | `{ nome, categoria, preparo, prazoResultadoDias }` |

Nada é apagado: há agendamentos e exames apontando para esses registros.

## Agendamentos (`agendamentos`)

| Rota | Faz |
| --- | --- |
| `GET /api/admin/agendamentos?de=&ate=&status=&unidadeId=&medicoId=&q=&pagina=&tamanho=` | toda a rede, por data e hora; `q` em paciente (nome, CPF) e médico |
| `GET /api/admin/agendamentos/metricas?de=&ate=` | `{ total, porStatus: { pendente: n, … } }` (padrão: mês corrente) |
| `GET /api/admin/agendamentos/calendario?mes=2026-09` | `{ mes, dias: { "15": { consultas, exames, retornos, cancelados } } }`; exames incluem as coletas marcadas |
| `PATCH /api/admin/agendamentos/{id}/status` | `{ status, motivo? }` com as transições da agenda; cancelar avisa o paciente |

## Dashboard (`dashboard`)

`GET /api/admin/dashboard?meses=9`:

```json
{
  "metricas": { "usuariosCadastrados": 19, "novosUsuarios": { "atual": 5, "anterior": 0 },
                "agendamentos": { "atual": 13, "anterior": 0 }, "clinicasAtivas": 10,
                "exames": { "atual": 4, "anterior": 0 }, "cancelamentos": { "atual": 1, "anterior": 0 } },
  "agendamentosPorMes": [{ "mes": "2026-09", "total": 13 }],
  "tiposDeAtendimento": { "consultas": 9, "retornos": 4, "exames": 4 },
  "clinicasMaisAcessadas": [{ "id": "…", "nome": "…", "endereco": "…", "status": "ativa", "agendamentos": 13 }],
  "ultimosAgendamentos": [ /* formato da lista de agendamentos */ ],
  "notificacoes": [ /* as notificações de quem está logado */ ]
}
```

"Do mês" é o mês corrente no fuso de negócio; `anterior` é o mês passado,
para o front mostrar a variação. A série mensal tem um ponto por mês,
inclusive os vazios.

## Configurações (`configuracoes`)

| Rota | Faz |
| --- | --- |
| `GET /api/admin/configuracoes` | `{ gerais: {…}, agendamento: {…}, seguranca: {…}, notificacoes: {…}, integracoes: {…} }` |
| `PUT /api/admin/configuracoes/{grupo}` | substitui o objeto do grupo; grupo desconhecido `404` |

O grupo `agendamento` **vale de verdade** (`agenda/RegrasDaAgenda`), a partir
da próxima requisição:

| Campo | Faixa | Efeito |
| --- | --- | --- |
| `antecedenciaMinimaHoras` | 0–72 | horários que começam antes de "agora + isto" não são oferecidos |
| `antecedenciaCancelamentoHoras` | 0–168 | até quanto antes o paciente cancela ou remarca |
| `janelaAgendamentoDias` | 1–365 | até quantos dias à frente se reserva |

Fora da faixa: `400` com o campo. O que não estiver gravado usa
`saudeplus.agenda.*` do `application.yml`. Os demais grupos são guardados como
vierem (objeto JSON) para as telas de configuração.

## Permissões (só ADMIN)

`GET /api/admin/permissoes`:

```json
{ "modulos": [{ "id": "dashboard", "rotulo": "Dashboard" }],
  "papeis": [{ "id": "GESTOR", "rotulo": "Gestor" }],
  "matriz": { "dashboard": { "GESTOR": true, "MEDICO": false, "ENFERMEIRO": true, "RECEPCIONISTA": true, "AGENTE": false } } }
```

`PUT /api/admin/permissoes` recebe a `matriz` e substitui a dos papéis
editáveis (papel ausente fica sem nenhum módulo). Módulo ou papel desconhecido
— inclusive `ADMIN` e `PACIENTE` — é `400`. Vale a partir da próxima requisição.

## Auditoria (só ADMIN)

`GET /api/admin/auditoria?usuarioId=&acao=&de=&ate=&pagina=&tamanho=` — mais
recentes primeiro; `acao` aceita prefixo (`usuario` traz `usuario.criar`,
`usuario.status`…).

```json
{ "id": "…", "quando": "2026-09-28T19:48:31Z", "usuario": { "id": "…", "nome": "Rita Recepção", "email": "…" },
  "acao": "agendamento.status", "entidade": "agendamento", "entidadeId": "…",
  "detalhe": { "status": "confirmada" }, "ip": "127.0.0.1" }
```

Registradas: `login`; `usuario.criar|alterar|status|convite`;
`unidade.*`, `especialidade.*`, `convenio.*`, `tipo_exame.*`;
`agendamento.status` (pela administração); `exame.agendar|analise|cancelar|resultado`;
`permissoes.alterar`; `configuracao.alterar`; `financeiro.lancar|status`;
`relatorio.exportar`; e as leituras de dado de saúde pelo médico,
`paciente.ficha.ver` e `exame.resultado.ver` (LGPD, ver
[banco-de-dados.md](banco-de-dados.md#lgpd-e-retenção)). O registro é gravado na mesma
transação da ação: se ela falhar, não fica registro. O IP é o da conexão
(atrás de proxy, configure `server.forward-headers-strategy`).

## No front

- `features/admin/pages/AdminConectado.jsx`: as telas ligadas à API (dashboard,
  usuários, clínicas, agendamentos, financeiro, relatórios, configurações). Sem API, voltam aos mocks
  com a faixa de demonstração, e as ações ficam desligadas.
- `features/admin/adaptadores.js`: converte as respostas para o formato dos
  mocks; os textos fixos dos cartões (rótulo, ícone, nota) continuam nos mocks.
- `features/admin/components/ModalNovoUsuario.jsx`: o botão "Novo usuário"
  (inclui CRM, especialidades e unidades para médico).
- `layouts/AdminLayout.jsx`: filtra o menu por `GET /api/auth/modulos`.
- Suporte continua com mocks.
