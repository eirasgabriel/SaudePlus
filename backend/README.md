# Back-end SaúdePlus

Java 21 + Spring Boot 4.1.1 com Maven, PostgreSQL 17 e migrações com Flyway.
O painel do médico ainda lê repositórios em memória. A troca para JPA e a
autenticação por JWT seguem as fases do plano de backend.

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

O perfil `prod` não tem valores padrão para o banco: as três variáveis `DB_*`
são obrigatórias. O Spring Boot não lê arquivos `.env`.

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
- `comum/`: base das entidades JPA (`EntidadeBase`, id UUID) e o envelope `Pagina<T>`.
- `config/`: CORS, `Clock` no fuso de negócio e metadados do OpenAPI.
- `exception/`: exceções de domínio e o tratador que gera o corpo de erro de `docs/api.md`.
- `security/`, `auth/`: autenticação JWT (próxima fase).
- `src/main/resources/db/migration/`: `V1__schema.sql` (schema completo) e `V2__seed_referencia.sql` (especialidades, convênios, tipos de exame, permissões e configurações).

Regras de schema: toda mudança no banco é uma migração nova (`V3__...sql`);
nunca edite uma migração já aplicada. O Hibernate só valida (`ddl-auto: validate`).

Consulte [a arquitetura](../docs/arquitetura.md) e o [contrato da API](../docs/api.md).
