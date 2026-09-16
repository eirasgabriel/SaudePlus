# Back-end SaúdePlus

Base Java 21 + Spring Boot 4.1.1, gerada com o Spring Initializr, usando Maven.
Inclui Spring MVC, validação de entrada e um teste de carregamento do contexto.
Ainda não há endpoints de negócio, autenticação ou banco de dados configurados.

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

O servidor usa a porta 8080 por padrão. Como ainda não há controllers, uma
requisição à raiz pode retornar 404. Para alterar a porta na sessão atual:

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
- `config/`: configuração compartilhada da aplicação.
- `security/`: futura configuração de segurança, filtros e autorização.
- `exception/`: futuras exceções e tratamento centralizado de erros HTTP.
- `auth/`, `profissionais/`, `clinicas/`, `exames/`, `agendamentos/`: funcionalidades.
- `agendamentos/dto/`: espaço reservado para contratos de entrada e saída.
- `src/main/resources/application.yml`: configuração do Spring Boot.
- `src/main/resources/db/migration/`: espaço reservado para migrations; Flyway ainda não foi adicionado.
- `src/test/java/br/com/saudeplus/`: testes automatizados.

Criar controllers, services, repositories, entidades e DTOs quando suas regras
forem implementadas. As pastas `security` e `auth` não implementam segurança por si só.
Escolher banco, driver e persistência antes de adicionar JPA e Flyway.
O Spring Boot não carrega arquivos `.env` automaticamente; use variáveis de ambiente.

Consulte [a arquitetura](../docs/arquitetura.md) e o [contrato da API](../docs/api.md).
Fonte da base: https://start.spring.io/
