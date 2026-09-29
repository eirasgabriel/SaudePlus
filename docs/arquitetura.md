# Arquitetura do SaúdePlus

O repositório tem duas aplicações que conversam só por HTTP:

- `frontend/`: React + Vite, a interface de visitante, paciente, profissional e administração;
- `backend/`: Java 21 + Spring Boot 4, a API REST em `/api/*`, com PostgreSQL.

```text
navegador ──► frontend (Vite, :5173) ──/api──► backend (Spring Boot, :8080) ──► PostgreSQL
```

Em desenvolvimento, o Vite faz proxy de `/api` para a porta 8080, então o front
não precisa de CORS nem de URL configurada. O contrato entre os dois está nos
arquivos `docs/api*.md` (índice no [README](../README.md#documentação)).

## Back-end

Pacotes por domínio em `backend/src/main/java/br/com/saudeplus/`. Dentro de
cada um, o fluxo é controller → service → repository, com DTOs em `record`
(pasta `dto/`); entidade JPA nunca sai na resposta.

| Pacote | Responsabilidade |
| --- | --- |
| `auth/`, `usuarios/`, `security/` | login, cadastro, perfil, senha; conta de acesso (`Usuario`, `Papel`); JWT e regras por prefixo |
| `publico/` | busca pública de profissionais, especialidades, unidades e horários livres |
| `areapaciente/` | rotas `/api/paciente/*` |
| `areamedico/` | rotas `/api/medico/*` |
| `admin/` | rotas `/api/admin/*`, incluindo dashboard, relatórios e o controle de acesso por módulo |
| `pacientes/`, `profissionais/`, `clinicas/` | cadastros: paciente, médico, especialidade, convênio, unidade |
| `agenda/`, `agendamentos/` | janelas de atendimento, bloqueios, cálculo de horários livres, agendamento e seus status |
| `exames/`, `arquivos/` | ciclo do exame e armazenamento dos arquivos de resultado |
| `financeiro/` | cobranças geradas pelos agendamentos, resumo e exportação |
| `notificacoes/` | caixa de notificações e envio de e-mail (hoje, no log) |
| `configuracoes/`, `auditoria/` | configurações por grupo, matriz de permissões e registro de atividades |
| `comum/`, `config/`, `exception/` | base das entidades, paginação, exportação CSV/PDF, CORS, relógio, formato de erro |
| `demo/` | agenda de demonstração, só no perfil `dev` |

### Decisões que atravessam o código

- **Banco:** PostgreSQL com Flyway (modelo completo em [banco-de-dados.md](banco-de-dados.md)). O schema só muda por migração nova
  (`db/migration/V*.sql`); o Hibernate apenas valida. Ids são UUID; instantes
  em `timestamptz`; dinheiro em `numeric(12,2)`. O fuso de negócio é
  `America/Sao_Paulo`, e o `Clock` é injetável para os testes.
- **Quem é o dono vem do token.** Nenhuma rota de paciente ou médico recebe o
  id do dono. Recurso de outro usuário responde `404`, não `403`, para não
  revelar que ele existe.
- **Papel e situação da conta são relidos a cada requisição.** Bloquear uma
  conta derruba o token já emitido.
- **Equipe e permissões:** além de `PACIENTE`, `MEDICO` e `ADMIN`, há os papéis
  de equipe (`GESTOR`, `ENFERMEIRO`, `RECEPCIONISTA`, `AGENTE`). Eles entram
  em `/api/admin/**` só nos módulos liberados na matriz de permissões.
- **Status único de agendamento** (`pendente`, `confirmada`, `aguardando`,
  `em_andamento`, `realizada`, `cancelada`, `faltou`) para paciente, médico e
  administração. As transições são validadas no domínio, e uma transição
  inválida responde `422`.
- **Reserva sem conflito:** um índice único parcial no banco impede duas
  reservas no mesmo horário. A violação vira `409`.
- **Efeitos colaterais depois do commit:** agendar, cancelar, liberar
  resultado e confirmar consulta publicam eventos. Os listeners
  (`@TransactionalEventListener`) criam notificações e cobranças numa transação
  própria, então uma falha neles não desfaz a ação principal.
- **Auditoria** na mesma transação da ação: se a ação falha, não fica registro.
- **Erros** sempre no formato de [api.md](api.md#formato-de-erro).

### Testes

`./mvnw verify` roda os testes unitários (regras puras, como o cálculo de
horários e as transições de status) e os de integração (`@TesteDeIntegracao`).
Os de integração sobem a aplicação inteira contra um PostgreSQL descartável do
Testcontainers e exercitam as rotas pelo MockMvc. Precisam do Docker rodando.

## Front-end

- `src/main.jsx`: inicialização do React, `BrowserRouter`, `AuthProvider` e CSS global.
- `src/app/App.jsx`: tabela de rotas; `RouteEffects.jsx` atualiza título e foco na navegação.
- `src/layouts/`: `MainLayout` e `Header` do site público; `AdminLayout` da administração.
- `src/features/`: código por domínio.
  - `home/`, `institucional/`, `ajuda/`: páginas públicas e seus conteúdos.
  - `profissionais/`: especialidades, busca e perfil do profissional (`profissionais.api.js`,
    `buscaParametros.js`, `perfil.js`).
  - `auth/`: Login, Criar conta, Recuperar senha e Nova senha, `auth.api.js`, `AuthProvider`
    e `destinoPendente.js` (volta ao endereço pedido depois do login).
  - `paciente/`: `paciente.api.js`, adaptadores e `pages/PacienteConectado.jsx`.
  - `medico/`: o painel do profissional (ver [dashboard-medico.md](dashboard-medico.md)) e `medico.api.js`.
  - `admin/`: `admin.api.js`, `exames.api.js`, adaptadores, `pages/AdminConectado.jsx` e o modal de novo usuário.
  - `agendamentos/`, `clinicas/`, `exames/`: reservadas, ainda vazias (`.gitkeep`).
- `src/pages/`: as telas do paciente (`ConsultasPage`, `ExamesPage`…) e da
  administração (`Admin*Page`, ver [admin.md](admin.md)).
- `src/components/`: componentes compartilhados: controles, gráficos,
  `ModalAgendamento`, `RotaProtegida` e `SomenteVisitante`.
- `src/services/`: `http.js` (envolve o `fetch`, manda o token, traduz o
  formato de erro e baixa arquivos com `baixarArquivo`), `sessaoStorage.js`
  (guarda o token) e os dados de demonstração (`dadosficticios.js`, `dadosAdmin*.js`).
- `src/styles/`: `tokens.css` (cores, tipografia, espaçamento) e `global.css`.
- `public/`: arquivos servidos diretamente, como o favicon.

### Como uma tela usa a API

As telas foram construídas antes da API e recebem tudo por props, com os dados
de demonstração como valor padrão. A ligação fica num componente "conectado"
por área (`PacienteConectado`, `PainelMedicoConectado`, `AdminConectado`):

1. busca na API (`features/<área>/<área>.api.js`);
2. converte a resposta para o formato que a tela já recebia (`adaptadores.js`);
3. passa os dados e as ações (salvar, cancelar, exportar…) como props.

Se a API não responder, a tela continua de pé com os dados de demonstração, uma
faixa avisa a origem e as ações ficam desligadas. Isso vale para
desenvolvimento e apresentação; não é modo offline.

`index.html`, `vite.config.js`, `eslint.config.js` e `package*.json` ficam na
raiz de `frontend/`.

## Regras de acesso

A autorização que vale é a do servidor, por prefixo de rota e, na
administração, por módulo (ver [api.md](api.md#autorização-por-prefixo)).
`RotaProtegida` e `SomenteVisitante`, no React, são conveniência de navegação:
o usuário pode alterar o que quiser no navegador.

O cadastro público cria só paciente: o corpo não tem campo de perfil. Médico e
equipe são criados pela administração. As contas iniciais de admin e médico
nascem com o servidor.

Segredos não pertencem ao front: nada em `frontend/` é secreto, inclusive o que
for definido em `VITE_*`. O segredo do JWT e as credenciais do banco vêm de
variáveis de ambiente do back-end.
