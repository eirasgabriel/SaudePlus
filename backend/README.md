# Back-end SaúdePlus

Java 21 + Spring Boot 4.1.1, usando Maven. Inclui Spring MVC, validação de
entrada, Spring Data JPA com banco H2 em memória, autenticação por JWT
(Spring Security) e CRUD completo para usuários, clínicas, profissionais,
exames e agendamentos. Um seed automático (`security/DataSeeder`) popula
o banco com dados de exemplo, incluindo o usuário administrador
`admin@saudeplus.com` / `admin123`.

## Pré-requisitos

Instale um JDK 21 e configure `JAVA_HOME` para a pasta do JDK e seu `bin` no PATH.
Confirme com `java -version`. Não é necessário instalar Maven separadamente:
o Maven Wrapper incluído baixa a versão configurada em `.mvn/wrapper/`.
A primeira execução precisa de internet para baixar Maven e dependências.

## Executar no PowerShell

A partir da raiz do repositório:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

O servidor usa a porta 8080 por padrão. Uma requisição a `/api/health`
deve retornar `{"status":"UP","service":"saudeplus"}`. Para alterar a
porta na sessão atual:

```powershell
$env:SERVER_PORT = '8081'
.\mvnw.cmd spring-boot:run
```

## Testar e empacotar

Dentro de `backend/`:

```powershell
.\mvnw.cmd verify
java -jar target/saudeplus-0.0.1-SNAPSHOT.jar
```

No Linux/macOS, use `sh ./mvnw verify` ou `sh ./mvnw spring-boot:run`.

## Organização

- `src/main/java/br/com/saudeplus/`: classe principal e pacotes Java por domínio.
- `config/`: configuração compartilhada da aplicação (CORS).
- `security/`: autenticação JWT, filtro de autorização e seed de dados.
- `exception/`: exceções e tratamento centralizado de erros HTTP.
- `auth/`, `usuarios/`, `profissionais/`, `clinicas/`, `exames/`, `agendamentos/`: domínios com controller, service, repository, entidade e DTO.
- `financeiro/`, `relatorios/`, `suporte/`, `configuracoes/`: painéis de leitura com dados agregados/demonstrativos.
- `src/main/resources/application.yml`: configuração do Spring Boot (datasource H2, JPA, porta).
- `src/main/resources/db/migration/`: espaço reservado para quando o projeto adotar Flyway (hoje o schema é gerado por `ddl-auto: update`).
- `src/test/java/br/com/saudeplus/`: testes automatizados.

O Spring Boot não carrega arquivos `.env` automaticamente; use variáveis de ambiente.

Consulte [a arquitetura](../docs/arquitetura.md) e o [contrato da API](../docs/api.md).
Fonte da base: https://start.spring.io/
