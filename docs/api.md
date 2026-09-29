# API SaúdePlus

> **Status: implementado** em `backend/` (pacote `br.com.saudeplus.auth`). Este
> documento é o contrato que o front-end e o back-end seguem.

Base: `http://localhost:8080`. Todas as respostas são JSON com charset UTF-8.

O front-end chama caminhos relativos (`/api/...`) e o Vite faz proxy para a porta
8080 (ver `frontend/vite.config.js`). Para apontar para outro endereço, use
`VITE_API_URL`.

## Autenticação

A API é *stateless*: não há sessão nem cookie. Depois do login, o cliente guarda o
token e o envia em cada chamada protegida:

```http
Authorization: Bearer <token>
```

O token esperado é um JWT assinado em HS256, com validade de algumas horas (8 é um
bom padrão). Ele deve carregar `sub` (id), `email`, `role`, `nome`, `iat` e `exp` —
nada sensível, porque JWT é assinado e não criptografado.

### Perfis

| Perfil | Como a conta nasce | Área inicial no front |
| --- | --- | --- |
| `PACIENTE` | cadastro público em `POST /api/auth/cadastro` | `/paciente` |
| `MEDICO` | criada pelo servidor na inicialização | `/medico` |
| `ADMIN` | criada pelo servidor na inicialização | `/admin` |

**Não pode existir rota pública que crie médico ou admin.** O corpo do cadastro não
tem campo de perfil: o servidor grava `PACIENTE` sempre. Um cliente que envie
`"role": "ADMIN"` deve ter o campo simplesmente ignorado.

### Contas fixas que o servidor precisa criar

Médico e admin não se cadastram. O servidor deve criar as duas contas na
inicialização, se ainda não existirem, com a senha gravada em BCrypt:

| Perfil | E-mail | Senha | Nome |
| --- | --- | --- | --- |
| `ADMIN` | `admin@saudeplus.com` | `Admin@SaudePlus2026` | Administrador SaudePlus |
| `MEDICO` | `medico@saudeplus.com` | `Medico@SaudePlus2026` | Dr. Carlos Andrade |

São credenciais de **desenvolvimento** e estão versionadas aqui, então valem como
públicas. Em qualquer ambiente exposto, leia e-mail e senha de variáveis de
ambiente. O seed deve criar a conta apenas quando o e-mail ainda não existe, para
que reiniciar o servidor não sobrescreva uma senha já trocada.

### Regras de segurança esperadas

- Senhas gravadas com BCrypt; nunca em texto puro.
- E-mail normalizado para minúsculas e com restrição de unicidade no banco.
- O `401` do login não pode diferenciar e-mail inexistente de senha errada, nem
  pelo texto nem pelo tempo de resposta (gaste um BCrypt mesmo quando o e-mail
  não existe).
- CORS liberado para a origem do front (`http://localhost:5173` em desenvolvimento).

---

## `POST /api/auth/cadastro`

Cria uma conta de paciente e já devolve o token, para o usuário entrar direto.

Público. Requisição:

```json
{
  "nomeCompleto": "Maria Souza",
  "email": "maria@exemplo.com",
  "senha": "umaSenhaForte1",
  "telefone": "(24) 99999-0000",
  "aceiteTermos": true
}
```

| Campo | Regra |
| --- | --- |
| `nomeCompleto` | obrigatório, 3 a 120 caracteres |
| `email` | obrigatório, formato de e-mail, até 180 caracteres, único |
| `senha` | obrigatória, 8 a 72 caracteres |
| `telefone` | opcional, até 20 caracteres, apenas dígitos, espaços e `( ) + -` |
| `aceiteTermos` | obrigatório, precisa ser `true` |

`201 Created`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expiraEmSegundos": 28800,
  "usuario": {
    "id": 3,
    "nomeCompleto": "Maria Souza",
    "email": "maria@exemplo.com",
    "telefone": "(24) 99999-0000",
    "role": "PACIENTE"
  }
}
```

Erros: `400` validação, `409` e-mail já cadastrado.

---

## `POST /api/auth/login`

Autentica qualquer perfil. Público.

```json
{ "email": "maria@exemplo.com", "senha": "umaSenhaForte1" }
```

`200 OK` com o mesmo corpo de `AuthResponse` acima.

Erros: `400` validação, `401` credenciais inválidas, `403` conta desativada.

A mensagem do `401` é sempre **"Dados incorretos. Confira o e-mail e a senha."** —
não diferencia e-mail inexistente de senha errada, para não revelar quais contas
existem. Pelo mesmo motivo, o serviço gasta um BCrypt mesmo quando o e-mail não
existe, igualando o tempo de resposta dos dois casos.

---

## `POST /api/auth/recuperar-senha`

Dispara o e-mail com o link de redefinição. Público.

```json
{ "email": "maria@exemplo.com" }
```

`200 OK`:

```json
{ "mensagem": "Se existir uma conta com este e-mail, enviamos as instruções de recuperação." }
```

Responde **sempre a mesma coisa**, exista ou não a conta. Dizer "e-mail não
encontrado" transformaria a rota num consultor de quais e-mails estão cadastrados.

Erros: `400` validação do e-mail.

### Como o link funciona

1. Gerar 32 bytes de aleatoriedade criptográfica, codificados em Base64 URL-safe.
2. Guardar no banco **só o SHA-256** desse valor. Quem obtiver uma cópia da tabela
   não deve conseguir montar um link válido.
3. Montar o link como `{URL_DO_FRONT}/redefinir-senha?token=<token>` e dar validade
   curta — 30 minutos é um bom padrão. A URL do front precisa ser configurável.
4. Emitir um token novo invalida os anteriores daquele usuário; usar um token o
   consome na hora.

Enquanto não houver servidor de SMTP, o mais prático é **escrever o link no console**
em vez de enviar: a equipe copia do log e cola no navegador para testar o fluxo.

---

## `POST /api/auth/redefinir-senha`

Grava a nova senha. Público — quem autoriza é o token do link.

```json
{ "token": "ZmFrZS10b2tlbi1kZS1leGVtcGxv...", "senha": "minhaNovaSenha1" }
```

Não recebe a confirmação da senha: conferir se os dois campos batem é proteção
contra erro de digitação e fica na tela.

`200 OK`:

```json
{ "mensagem": "Senha alterada com sucesso. Use a nova senha para entrar." }
```

Erros: `400` validação, ou token ausente, adulterado, já usado ou expirado — nos
dois casos com `erro: "Link inválido"`.

---

## `GET /api/auth/perfil`

Dados do usuário do token. Exige `Authorization`. O front usa esta rota ao abrir a
aplicação para revalidar o token guardado no navegador.

`200 OK`:

```json
{
  "id": 3,
  "nomeCompleto": "Maria Souza",
  "email": "maria@exemplo.com",
  "telefone": "(24) 99999-0000",
  "role": "PACIENTE"
}
```

Erros: `401` token ausente, inválido ou expirado.

---

## Formato de erro

Todas as falhas usam o mesmo corpo (`ErroResposta`):

```json
{
  "timestamp": "2026-09-21T03:12:44.318Z",
  "status": 400,
  "erro": "Dados inválidos",
  "mensagem": "Confira os campos destacados e tente novamente.",
  "campos": {
    "email": "Informe um e-mail válido",
    "senha": "A senha deve ter entre 8 e 72 caracteres"
  }
}
```

`campos` só aparece em erros de validação (`400`) e traz o nome do campo e a
mensagem — é o que o formulário usa para destacar o input correspondente.

| Status | Quando |
| --- | --- |
| `400` | validação de entrada |
| `401` | credenciais inválidas, token ausente/expirado |
| `403` | conta desativada, ou perfil sem permissão para a rota |
| `409` | e-mail já cadastrado |

---

## Autorização por prefixo

Prefixos reservados para as próximas funcionalidades:

| Prefixo | Exigência |
| --- | --- |
| `/api/auth/login`, `/api/auth/cadastro` | público |
| `/api/auth/recuperar-senha`, `/api/auth/redefinir-senha` | público |
| `/api/admin/**` | perfil `ADMIN` |
| `/api/medico/**` | perfil `MEDICO` |
| `/api/paciente/**` | perfil `PACIENTE` |
| qualquer outra | autenticado |

As proteções de rota no React são apenas conveniência de navegação. A autorização
que vale é esta, no servidor.

---

## Limitações conhecidas

- **Só a autenticação existe**: os prefixos `/api/admin`, `/api/medico` e
  `/api/paciente` já são protegidos por perfil, mas ainda não têm controllers.
- **Conta desativada não derruba token já emitido**: `/api/auth/perfil` recusa, mas
  as demais rotas só notam a desativação quando o token expirar.
- **Envio de e-mail**: sem SMTP, o link de recuperação precisa sair no log do
  servidor. Vale isolar o envio atrás de uma interface, para trocar por um
  provedor real sem mexer nas regras de negócio.
- **Tokens JWT não são revogáveis**: numa autenticação stateless, trocar a senha
  não invalida um token já emitido — ele continua valendo até expirar. Resolver
  isso exige uma lista de revogação ou tokens curtos com refresh.
- **Sem limite de tentativas**: nem o login nem o pedido de recuperação têm
  throttling. Vale adicionar antes de expor a API na internet.
- **Login social (Google/Apple)** e os documentos de **Termos de Uso** e
  **Política de Privacidade** não existem: os botões estão no layout e avisam que
  o recurso está por vir.
- As demais funcionalidades (profissionais, clínicas, exames, agendamentos)
  continuam sem endpoints.
- O `token` de `redefinir-senha` é enviado no corpo (não na URL), e o link só sai no
  log do servidor (`LogEnviadorDeEmail`).
