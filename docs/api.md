# API SaúdePlus

Servidor Spring Boot (Java 21 / Spring Boot 4.1.1), porta `8080` por padrão.
Banco de dados: H2 em memória (`jdbc:h2:mem:saudeplus`), populado por um
seed automático (`security/DataSeeder`) ao subir a aplicação. Console H2
disponível em `/h2-console` (usuário `sa`, senha `sa`).

Todas as rotas ficam sob o prefixo `/api`. Exceto `/api/health` e
`/api/login`, todas exigem o header `Authorization: Bearer <token>`,
obtido no login. O front-end (`services/api.js`) já injeta esse header
automaticamente quando há um token salvo em `localStorage`.

## Autenticação

| Método | Rota          | Descrição                                   |
| ------ | ------------- | -------------------------------------------- |
| GET    | `/health`     | Health-check público.                        |
| POST   | `/login`      | Autentica por e-mail/senha e retorna um JWT.  |

Usuário administrador padrão (criado pelo seed):
`admin@saudeplus.com` / `admin123`.

## Usuários — `/api/usuarios`

CRUD completo. `senha` é obrigatória ao criar e opcional ao atualizar
(em branco mantém a senha atual). Senhas são armazenadas com BCrypt.

| Método | Rota              | Descrição            |
| ------ | ----------------- | --------------------- |
| GET    | `/usuarios`       | Lista todos.           |
| GET    | `/usuarios/{id}`  | Busca por id.          |
| POST   | `/usuarios`       | Cria um usuário.       |
| PUT    | `/usuarios/{id}`  | Atualiza um usuário.   |
| DELETE | `/usuarios/{id}`  | Remove um usuário.     |

## Clínicas — `/api/clinicas`

CRUD completo (`nome`, `especialidade`, `endereco`, `cidade`, `telefone`,
`status`).

## Profissionais — `/api/profissionais`

CRUD completo (`nome`, `especialidade`, `clinica`, `disponibilidade`).

## Exames — `/api/exames`

CRUD completo (`nome`, `categoria`, `duracaoMinutos`, `disponivel`).

## Agendamentos — `/api/agendamentos`

| Método | Rota                     | Descrição                                    |
| ------ | ------------------------ | ---------------------------------------------- |
| GET    | `/agendamentos`          | Lista todos.                                    |
| GET    | `/agendamentos/{id}`     | Busca por id.                                   |
| POST   | `/agendamentos`          | Cria (`paciente`, `profissionalId`, `data`, `hora`, `tipo`, `status?`). |
| PUT    | `/agendamentos/{id}`     | Atualiza um agendamento.                        |
| PATCH  | `/agendamentos/{id}/status` | Atualiza apenas o status (`{ "status": "confirmado" }`). |
| DELETE | `/agendamentos/{id}`     | Remove um agendamento.                          |

`profissionalId` é validado contra `/api/profissionais`; o nome do
profissional é resolvido no servidor e salvo junto ao agendamento.

## Painéis somente leitura

Estas rotas alimentam telas de visão geral com dados agregados/demonstrativos
e ainda não têm persistência própria (não há tela de edição para elas):

| Método | Rota              |
| ------ | ----------------- |
| GET    | `/financeiro`     |
| GET    | `/relatorios`     |
| GET    | `/suporte`        |
| GET    | `/configuracoes`  |

## Erros

Erros de validação (`400`) retornam:

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Validation failed",
  "message": "Dados inválidos para a requisição.",
  "details": [{ "field": "email", "message": "Email inválido." }]
}
```

`ResourceNotFoundException` e outras `RuntimeException` também retornam
`400` com `message` explicando o problema (ver `exception/ApiExceptionHandler`).
