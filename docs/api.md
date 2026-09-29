# API SaúdePlus

> **Status: implementado** em `backend/src/main/java/br/com/saudeplus/auth/` e
> `security/`. Os testes de `AuthApiTest` cobrem este contrato. Se a API não
> estiver no ar, o login mostra *"Não foi possível falar com o servidor"*.

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
    "id": "0b9c6f3e-5a51-4c8e-9f2d-6f1d2a7c4b10",
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
  "id": "0b9c6f3e-5a51-4c8e-9f2d-6f1d2a7c4b10",
  "nomeCompleto": "Maria Souza",
  "email": "maria@exemplo.com",
  "telefone": "(24) 99999-0000",
  "role": "PACIENTE"
}
```

Erros: `401` token ausente, inválido ou expirado, ou conta desativada depois do
login. Papel e situação da conta são relidos do banco a cada requisição, então
bloquear uma conta derruba o token já emitido.

Ids são UUID e trafegam como string.

---

## `PUT /api/auth/perfil`

Atualiza os dados do próprio usuário. Exige `Authorization`. E-mail e perfil
não mudam por aqui.

```json
{ "nomeCompleto": "Maria Souza Lima", "telefone": "(21) 98888-7777", "fotoUrl": "https://..." }
```

`nomeCompleto` segue a regra do cadastro; `telefone` e `fotoUrl` (https, até 500
caracteres) são opcionais e, vazios, apagam o valor. `200 OK` com o mesmo corpo
de `GET /api/auth/perfil`.

---

## `GET /api/auth/modulos`

Módulos da área administrativa que quem está logado pode abrir, na ordem do
menu: todos para `ADMIN`, os liberados na matriz para a equipe
(`GESTOR`, `ENFERMEIRO`, `RECEPCIONISTA`, `AGENTE`), nenhum para paciente.

```json
["dashboard", "agendamentos", "relatorios"]
```

---

## `PUT /api/auth/senha`

Troca a senha de quem está logado. Exige `Authorization`.

```json
{ "senhaAtual": "umaSenhaForte1", "novaSenha": "outraSenha99" }
```

`200 OK` com `{ "mensagem": "Senha alterada com sucesso." }`. Senha atual errada
devolve `400` com `campos.senhaAtual`, e não `401`: o front trata `401` como
sessão expirada e faria logout.

---

## Busca pública (`/api/publico`)

Rotas sem login usadas pela busca de profissionais (`/buscar`). Implementadas em
`backend/src/main/java/br/com/saudeplus/publico/` e chamadas por
`frontend/src/features/profissionais/profissionais.api.js`.

| Rota | Devolve |
| --- | --- |
| `GET /api/publico/especialidades` | `[{ id, slug, nome, descricao }]`, por nome |
| `GET /api/publico/tipos-exame` | `[{ id, nome, categoria, preparo, prazoResultadoDias }]` |
| `GET /api/publico/convenios` | `[{ id, nome }]`, só os ativos |
| `GET /api/publico/cidades` | `[{ nome, uf, rotulo }]`; `rotulo` é o texto do filtro ("São Paulo - SP") |
| `GET /api/publico/unidades?cidade=&uf=` | unidades em funcionamento, opcionalmente de uma cidade |
| `GET /api/publico/unidades/{id}` | uma unidade; `404` se não existe ou não está `ativa` |
| `GET /api/publico/profissionais` | busca paginada (abaixo) |
| `GET /api/publico/profissionais/{id}` | perfil completo; `404` se não existe ou a conta não está ativa |
| `GET /api/publico/profissionais/{id}/horarios?de=&ate=` | horários livres para reserva (ver [api-painel-medico.md](api-painel-medico.md#horários-públicos)) |
| `GET /api/publico/profissionais/{id}/avaliacoes?pagina=&tamanho=` | avaliações, mais recentes primeiro: `{ nota, comentario, autor ("Ana F."), data }` |

### `GET /api/publico/profissionais`

| Parâmetro | Regra |
| --- | --- |
| `q` | trecho do nome do médico ou de uma especialidade dele, sem diferenciar maiúsculas |
| `especialidade` | slug; pode repetir (`?especialidade=a&especialidade=b` vale "qualquer uma") |
| `cidade`, `uf` | cidade de alguma unidade em funcionamento do médico |
| `modalidade` | `presencial`, `online` ou `domiciliar`; pode repetir |
| `convenio` | nome exato; pode repetir |
| `ordem` | `relevancia` (padrão, mais avaliações), `avaliacao`, `avaliacoes` ou `nome` |
| `pagina`, `tamanho` | começa em `0`; `tamanho` padrão 20, máximo 50 |

Filtros diferentes se somam. Valor desconhecido em `modalidade` ou `ordem` devolve
`400`. Só aparecem médicos com conta ativa e pelo menos uma unidade `ativa`.

```json
{
  "conteudo": [{
    "id": "c1000000-0000-4000-8000-000000000001",
    "nome": "Dr. Roberto Almeida",
    "fotoUrl": "/images/profissionais/dr-roberto-almeida.jpg",
    "crm": "123.456", "crmUf": "SP",
    "especialidades": [{ "slug": "cardiologia", "nome": "Cardiologia" }],
    "nota": 4.90, "avaliacoes": 328,
    "local": { "id": "…", "nome": "SaudePlus Paulista", "endereco": "Av. Paulista, 1000", "bairro": "Bela Vista",
               "cidade": "São Paulo", "uf": "SP", "telefone": "(11) 3000-1000", "horarioFuncionamento": "…", "mapUrl": null },
    "modalidades": ["presencial", "online"],
    "convenios": ["Amil", "Bradesco Saúde", "Unimed"],
    "valorConsulta": 250.00,
    "proximaData": "2026-09-29",
    "proximosHorarios": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30"]
  }],
  "pagina": 0, "tamanho": 20, "totalElementos": 4, "totalPaginas": 1
}
```

`local` é a unidade da cidade filtrada (ou a primeira em funcionamento).
`modalidades` vêm das disponibilidades de agenda do médico. `proximaData` é o
primeiro dia com horário livre nas próximas duas semanas (ou `null`), e
`proximosHorarios` traz até seis horários livres desse dia. A busca não ignora acentos: "joao" não
encontra "João".

---

## Formato de erro

Todas as falhas usam o mesmo corpo (`ErroResposta`):

```json
{
  "timestamp": "2026-09-21T03:12:44.318Z",
  "status": 400,
  "erro": "Dados inválidos",
  "mensagem": "Confira os campos destacados e tente novamente.",
  "caminho": "/api/auth/cadastro",
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
| `404` | recurso ou rota inexistente |
| `405` | método HTTP que a rota não aceita |
| `409` | e-mail já cadastrado, horário já reservado, registro alterado por outra pessoa ao mesmo tempo |
| `413` | arquivo enviado acima do limite (10 MB) |
| `415` | corpo que não é JSON |
| `422` | regra de negócio violada |
| `429` | tentativas demais de login ou de recuperação de senha; `Retry-After` diz em quantos segundos tentar de novo |
| `500` | erro inesperado (detalhes só no log do servidor) |

---

## Autorização por prefixo

Regras aplicadas em `security/SecurityConfig.java`:

| Prefixo | Exigência |
| --- | --- |
| `/api/auth/login`, `/api/auth/cadastro` | público |
| `/api/auth/recuperar-senha`, `/api/auth/redefinir-senha` | público |
| `/api/publico/**` | público (busca de profissionais, especialidades, unidades) |
| `/api/admin/**` | `ADMIN`, ou equipe com o módulo liberado na matriz de permissões (ver [api-admin.md](api-admin.md); exames em [api-exames.md](api-exames.md); financeiro e relatórios em [api-financeiro-relatorios.md](api-financeiro-relatorios.md)) |
| `/api/medico/**` | perfil `MEDICO` (rotas em [api-painel-medico.md](api-painel-medico.md)) |
| `/api/paciente/**` | perfil `PACIENTE` (rotas em [api-area-paciente.md](api-area-paciente.md)) |
| qualquer outra | autenticado |

As proteções de rota no React são apenas conveniência de navegação. A autorização
que vale é esta, no servidor.

---

## Limitações conhecidas

- **Envio de e-mail**: não há provedor. Em `dev` e `test`, o e-mail inteiro
  (com o link de recuperação ou de convite) sai no log do servidor
  (`notificacoes/EnvioEmailNoLog`). Nos outros perfis, o log registra só o
  assunto e o destinatário mascarado (`EnvioEmailDesligado`): o link dá acesso
  à conta e não pode ficar em log de produção. Enviar de verdade é implementar
  a interface `EnvioEmail`.
- **Troca de senha não derruba tokens já emitidos**: bloquear a conta derruba
  (a situação é relida a cada requisição), mas trocar a senha não — o token
  antigo vale até expirar. Resolver exige lista de revogação ou refresh token.
- **Tempo de resposta da recuperação**: e-mail existente grava o token e monta
  o e-mail; inexistente só consulta. A diferença de tempo é pequena, mas existe.
- **Limite de tentativas em memória**: login (5 falhas em 15 min por IP + e-mail,
  30 por IP) e recuperação de senha (3 por hora por e-mail, 10 por IP)
  respondem `429` ao passar do limite (`auth/ProtecaoContraForcaBruta`,
  `saudeplus.limites.*`). A contagem é por instância: com várias instâncias,
  troque por um armazenamento compartilhado. Atrás de proxy, configure
  `server.forward-headers-strategy` para contar pelo IP do cliente.
- **Login social (Google/Apple)** e os documentos de **Termos de Uso** e
  **Política de Privacidade** não existem: os botões estão no layout e avisam que
  o recurso está por vir.
- **Conta inicial de médico** ganha o perfil profissional com CRM, UF,
  especialidade e unidade vindos de `SEED_MEDICO_*`. Sem CRM configurado (o
  padrão em produção), só a conta de acesso é criada.
