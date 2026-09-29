# Back-end SaúdePlus

Java 21 + Spring Boot 4.1.1 com Maven, PostgreSQL 17 e migrações com Flyway.
Pronto: autenticação por JWT (`/api/auth/*`), busca pública
(`/api/publico/*`), área do médico (`/api/medico/*`), área do paciente
(`/api/paciente/*`), exames com upload de resultado e administração
(`/api/admin/*`, com financeiro, relatórios em PDF/CSV, permissões por módulo
e auditoria), tudo em PostgreSQL.

## Pré-requisitos

- **JDK 21**, com `JAVA_HOME` configurado. Confirme com `java -version`.
  Não precisa instalar Maven: o Maven Wrapper incluído baixa a versão certa.
- **Docker Desktop rodando.** No perfil `dev`, o Spring Boot sobe o Postgres
  do `compose.yaml` sozinho, e os testes de integração usam Testcontainers.

A primeira execução precisa de internet para baixar Maven, dependências e a
imagem do Postgres.

## Executar no PowerShell

A partir da raiz do repositório:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

O perfil padrão é `dev`. Ele faz três coisas:

- sobe o container `postgres` do `compose.yaml` (e o deixa rodando);
- aplica as migrações de `src/main/resources/db/migration/`;
- libera o Swagger em http://localhost:8080/swagger-ui.html.

O servidor usa a porta 8080. Para mudar a porta na sessão atual:

```powershell
$env:SERVER_PORT = '8081'
.\mvnw.cmd spring-boot:run
```

### Variáveis de ambiente

| Variável | Padrão (dev) | Uso |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/saudeplus` | URL JDBC do banco |
| `DB_USUARIO` / `DB_SENHA` | `saudeplus` / `saudeplus` | credenciais do banco |
| `SERVER_PORT` | `8080` | porta HTTP |
| `FRONT_URL` | `http://localhost:5173` | base dos links enviados por e-mail |
| `ARQUIVOS_DIR` | `./dados/arquivos` | pasta dos resultados de exame (em produção, um volume persistente) |
| `JWT_SEGREDO` | segredo público de desenvolvimento | chave HS256 do token (≥ 32 bytes) |
| `SEED_ENABLED` | `true` em dev, `false` nos demais | liga as contas iniciais e os dados de teste |
| `SEED_SENHA_PADRAO` | `teste@saudeplus` | senha de toda conta de teste cuja `SEED_*_SENHA` não veio |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_SENHA` | `admin@saudeplus.com` / senha padrão | conta inicial de admin |
| `SEED_MEDICO_EMAIL` / `SEED_MEDICO_SENHA` | `medico@saudeplus.com` / senha padrão | conta inicial de médico |
| `SEED_PACIENTE_EMAIL` / `SEED_PACIENTE_SENHA` | `paciente@saudeplus.com` / senha padrão | conta principal de paciente |
| `SEED_MEDICO_CRM` / `SEED_MEDICO_CRM_UF` | `112.233` / `RJ` | CRM do perfil do médico inicial (sem CRM, o perfil não é criado) |
| `SEED_MEDICO_ESPECIALIDADE` / `SEED_MEDICO_UNIDADE` | `clinico-geral` / `Clínica da Família – Centro` (só dev) | especialidade (slug) e unidade (nome) do médico inicial |

O perfil `prod` não tem valores padrão para o banco nem para o JWT: as
variáveis `DB_*` e `JWT_SEGREDO` são obrigatórias, e a aplicação não sobe com um
segredo curto. O Spring Boot não lê arquivos `.env`.

### Seeds (contas e dados de teste)

Com `SEED_ENABLED=true`, a subida cria, se ainda não existirem:

- `auth/ContasIniciais`: o admin e o médico principal (`SEED_ADMIN_*`, `SEED_MEDICO_*`);
- `seed/DadosDeTeste`: o paciente principal (`SEED_PACIENTE_*`), mais dois
  médicos (`medico2@exemplo.com`, cardiologia; `medico3@exemplo.com`,
  pediatria) e nove pacientes (`paciente2@exemplo.com` a
  `paciente10@exemplo.com`), com CPFs fictícios válidos (base `900.000.0xx`).

Cada registro é conferido por e-mail (e CPF/CRM) antes de ser criado: rodar a
cada deploy não duplica nada e nunca sobrescreve uma conta existente, nem a
senha já trocada. Conta sem `SEED_*_SENHA` nasce com `SEED_SENHA_PADRAO`, e o
log avisa (sem imprimir a senha). Num ambiente público, defina senhas próprias
ou troque-as após o primeiro acesso.

Sem SMTP, em `dev` e `test` o link de "esqueci minha senha" sai no log do
servidor. Em `prod`, o log registra só que o e-mail não foi enviado, sem o
link (ele dá acesso à conta).

Login e recuperação de senha têm limite de tentativas (`saudeplus.limites.*`,
padrão: 5 falhas de login em 15 min por IP + e-mail, 3 pedidos de recuperação
por hora por e-mail); ao passar, a API responde `429`.

### Dados de demonstração

Nos perfis `dev` e `test`, o Flyway também carrega
`src/main/resources/db/demo/R__dados_demonstracao.sql`: unidades em cinco cidades
e sete médicos com especialidades, convênios e disponibilidades, usados pela
busca pública, e oito pacientes. Todas essas contas entram com a senha
`Demo@SaudePlus2026` (e-mails `*@demo.saudeplus.com`). No perfil `dev`, a cada
subida, `demo/AgendaDeDemonstracao` também garante uma agenda para hoje do
médico inicial, com exames pendentes, notificações e as cobranças das
consultas (pagas as realizadas, pendentes as demais). O arquivo é uma migração
repetível com ids fixos: editar e reiniciar reaplica sem duplicar. Nunca é
carregado em `prod`.

## Testar e empacotar

Dentro de `backend/`, com o Docker rodando:

```powershell
.\mvnw.cmd verify
java -jar target/saudeplus-0.0.1-SNAPSHOT.jar
```

Testes de integração usam `@TesteDeIntegracao`, que sobe a aplicação inteira
contra um Postgres descartável do Testcontainers.

No Linux/macOS, use `sh ./mvnw verify` ou `sh ./mvnw spring-boot:run`.

## Organização

- `src/main/java/br/com/saudeplus/`: pacotes por domínio (controller → service → repository, DTOs em `dto/`).
- `comum/`: base das entidades JPA (`EntidadeBase`, id UUID), o envelope `Pagina<T>` e a exportação CSV/PDF (`Exportacao`).
- `config/`: CORS, `Clock` no fuso de negócio e metadados do OpenAPI.
- `exception/`: exceções de domínio e o tratador que gera o corpo de erro de `docs/api.md`.
- `security/`: JWT (emissão e validação), regras de acesso por prefixo e respostas 401/403.
- `auth/`: login, cadastro de paciente, perfil, troca e recuperação de senha, contas iniciais.
- `usuarios/`: a conta de acesso (`Usuario`) e o `Papel`.
- `profissionais/`, `clinicas/`: médicos, especialidades, convênios e unidades.
- `agenda/`, `agendamentos/`: janelas de atendimento, bloqueios, cálculo de horários livres e agendamentos com o status unificado.
- `areamedico/`: rotas `/api/medico/*` (painel, agenda, pacientes, configuração da agenda).
- `areapaciente/`: rotas `/api/paciente/*` (painel, reservar, cancelar, remarcar, histórico, avaliações, exames).
- `exames/`, `arquivos/`: ciclo do exame (pedido, coleta, análise, resultado) e armazenamento dos arquivos.
- `admin/`: rotas `/api/admin/*`: usuários (inclui criar médico), unidades, catálogos, agendamentos, dashboard, exames da clínica, financeiro e relatórios.
- `financeiro/`: cobranças (`Transacao`), geradas ao confirmar a consulta e anuladas ao cancelar; resumo e exportação.
- `configuracoes/`: grupos de configuração (o `agendamento` alimenta `agenda/RegrasDaAgenda`) e a matriz de permissões.
- `auditoria/`: registro de atividades e sua consulta.
- `notificacoes/`: caixa de notificações; eventos de agendamento e de exame viram avisos depois do commit.
- `demo/`: agenda de demonstração do médico inicial, só no perfil `dev`.
- `publico/`: rotas sem login da busca de profissionais (`/api/publico/*`).
- `src/main/resources/db/migration/`: `V1__schema.sql` (schema completo), `V2__seed_referencia.sql` (especialidades, convênios, tipos de exame, permissões e configurações), `V3__permissoes_padrao_seguras.sql`, `V4__transacoes_pagamento.sql`, `V5__controle_de_concorrencia.sql` (versão para travamento otimista de consultas e cobranças), `V6__integridade_da_agenda_e_lgpd.sql` (sem consultas sobrepostas, cobrança única por consulta, índices e marcações LGPD; ver [docs/banco-de-dados.md](../docs/banco-de-dados.md)) e `V7__contato_das_unidades.sql` (CNPJ e e-mail das unidades); `db/demo/` só em dev e test.

Regras de schema: toda mudança no banco é uma migração nova (`V7__...sql`);
nunca edite uma migração já aplicada. O Hibernate só valida (`ddl-auto: validate`).

Consulte [a arquitetura](../docs/arquitetura.md) e o [contrato da API](../docs/api.md).
