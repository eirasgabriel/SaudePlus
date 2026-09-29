# Back-end SaúdePlus

Java 21 + Spring Boot 4.1.1 (Maven). Implementa a autenticação descrita em
[../docs/api.md](../docs/api.md): cadastro de paciente, login para os três perfis,
recuperação e redefinição de senha e perfil do usuário logado.

## Contas e perfis

| Perfil | Como a conta nasce |
| --- | --- |
| `PACIENTE` | cria a própria conta e senha em `POST /api/auth/cadastro` |
| `MEDICO` | **uma conta única**, criada na inicialização |
| `ADMIN` | **uma conta única**, criada na inicialização |

Credenciais de desenvolvimento (as mesmas de `docs/api.md`):

| Perfil | E-mail | Senha |
| --- | --- | --- |
| ADMIN | `admin@saudeplus.com` | `Admin@SaudePlus2026` |
| MEDICO | `medico@saudeplus.com` | `Medico@SaudePlus2026` |

O seed só cria a conta se o e-mail ainda não existe; reiniciar não sobrescreve uma
senha já trocada. Não existe rota pública que crie médico ou admin, e o campo `role`
enviado no cadastro é ignorado.

## Pré-requisitos

JDK 21 com `JAVA_HOME` configurado. O Maven Wrapper baixa o Maven; a primeira
execução precisa de internet.

## Executar

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

No Linux/macOS: `sh ./mvnw spring-boot:run`. Sobe na porta 8080 com H2 em arquivo
(`backend/data/`), sem instalar banco. O front (`npm run dev`) já faz proxy de `/api`.

Ao pedir "Esqueci a senha", o link de redefinição aparece **no console da API**
(`[E-MAIL SIMULADO]`), porque ainda não há SMTP.

## Testar

```powershell
.\mvnw.cmd verify
```

Os testes (`src/test/`) usam H2 em memória (perfil `test`) e cobrem cadastro, login
das contas fixas, autorização por perfil e recuperação de senha.

## Variáveis de ambiente

O Spring Boot não lê arquivos `.env`; defina as variáveis no ambiente.

| Variável | Padrão | Uso |
| --- | --- | --- |
| `SERVER_PORT` | `8080` | porta |
| `JWT_SECRET` | chave de dev | segredo HS256, mínimo 32 caracteres. **Obrigatório trocar fora do desenvolvimento** |
| `JWT_EXPIRACAO_HORAS` | `8` | validade do token |
| `DB_URL` / `DB_USER` / `DB_PASSWORD` | H2 em arquivo | ex.: `jdbc:postgresql://localhost:5432/saudeplus` |
| `CORS_ORIGENS` | `http://localhost:5173` | origens do front, separadas por vírgula |
| `FRONT_URL` | `http://localhost:5173` | base do link de recuperação |
| `RECUPERACAO_VALIDADE_MINUTOS` | `30` | validade do link |
| `ADMIN_EMAIL` / `ADMIN_SENHA` / `ADMIN_NOME` | valores de dev | conta do admin |
| `MEDICO_EMAIL` / `MEDICO_SENHA` / `MEDICO_NOME` | valores de dev | conta do médico |

## Organização

Veja [../docs/arquitetura.md](../docs/arquitetura.md). Resumo: `auth/` (regras e
API), `security/` (JWT e perfis), `config/` (propriedades e seed), `exception/`
(erros no formato único) e `db/migration/` (Flyway).
