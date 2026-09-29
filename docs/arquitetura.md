# Arquitetura do SaúdePlus

O repositório tem duas aplicações: `frontend/` (React + Vite) e `backend/` (Spring
Boot). O front conversa com a API por HTTP; o contrato está em [api.md](api.md).

## Front-end

- `src/main.jsx`: inicialização do React, `BrowserRouter`, `AuthProvider` e CSS global.
- `src/app/App.jsx`: tabela de rotas da aplicação.
- `src/layouts/`: estruturas compartilhadas de página e cabeçalho.
- `src/components/`: componentes usados por diferentes funcionalidades, como
  `RotaProtegida` e `SomenteVisitante`.
- `src/features/`: código organizado por domínio: auth, painel, profissionais,
  clinicas, exames e agendamentos. Criar `pages/`, `components/` e `hooks/` dentro
  de cada funcionalidade quando houver implementação para eles.
  - `features/auth/` já está implementada: Login, Criar conta, Recuperar senha e
    Nova senha, além de `auth.api.js`, `AuthProvider.jsx` e `auth.context.js`.
    As telas ocupam a página inteira; `CartaoAuth.jsx` é a moldura compartilhada.
  - `features/painel/` é uma área interna provisória, só para o login ter destino.
- `src/services/`: infraestrutura compartilhada de acesso HTTP. `http.js` envolve o
  `fetch` e traduz o formato de erro da API; `sessaoStorage.js` guarda o token.
  Operações específicas pertencem à funcionalidade, por exemplo
  `features/agendamentos/agendamentos.api.js`.
- `src/assets/images/`: imagens importadas pelos componentes.
- `src/styles/global.css`: estilos globais; estilos de componentes ficam próximos deles.
- `public/`: arquivos servidos diretamente, como o favicon.

`index.html`, `vite.config.js`, `eslint.config.js` e `package*.json` permanecem
na raiz de `frontend/`. Não mover `index.html` para `public/`. O `vite.config.js`
faz proxy de `/api` para a API na porta 8080 durante o desenvolvimento.

## Back-end

Java 21, Spring Boot 4, Maven. Pacotes em `backend/src/main/java/br/com/saudeplus/`:

- `auth/`: entidades `Usuario` e `TokenRedefinicaoSenha`, repositórios, `AuthService`
  (regras), `AuthController` (`/api/auth/*`), `dto/` e a porta `EnviadorDeEmail`
  (por ora `LogEnviadorDeEmail` escreve o link no console).
- `security/`: `SecurityConfig` (rotas públicas, perfil por prefixo, CORS, stateless),
  `JwtConfig` e `JwtService` (JWT HS256 assinado com `JWT_SECRET`).
- `config/`: `SaudePlusProperties` (configuração tipada) e `ContasIniciais` (seed de
  médico e admin, só se o e-mail ainda não existir).
- `exception/`: `ApiException` e `GlobalExceptionHandler`, que devolvem sempre o
  formato `{ timestamp, status, erro, mensagem, campos? }`.
- `clinicas/`, `exames/`, `profissionais/`, `agendamentos/`: reservados, sem código ainda.
- `src/main/resources/db/migration/`: migrations Flyway (`V1` cria usuários e tokens).
  O esquema é do Flyway; o Hibernate não altera tabelas (`ddl-auto: none`).

Banco: H2 em arquivo (`backend/data/`) por padrão, PostgreSQL via `DB_URL`,
`DB_USER` e `DB_PASSWORD`. O SQL das migrations é portável entre os dois.

## Regra de acesso por perfil

Existem três perfis: `PACIENTE`, `MEDICO` e `ADMIN`. O cadastro público deve criar
exclusivamente paciente — o corpo do cadastro não tem campo de perfil, então o
servidor grava `PACIENTE` sempre. Médico e admin nascem apenas do seed feito pelo
servidor na inicialização, e entram pela mesma tela de login.

A autorização que vale é a do servidor, por prefixo de rota. `RotaProtegida` e
`SomenteVisitante`, no React, são conveniência de navegação: o usuário pode alterar
o que quiser no navegador, então eles não substituem a checagem no back-end.

O front-end consome a API por HTTP; não acessa o banco diretamente. Autorização e
regras de disponibilidade devem ser garantidas no servidor e no banco quando
implementados. Segredos não pertencem ao código enviado ao navegador — nada que
esteja em `frontend/` é secreto, inclusive o que for definido em `VITE_*`.

As pastas ainda sem implementação possuem `.gitkeep` para serem versionadas.
Remover os marcadores quando as pastas receberem arquivos reais.

## Realocação aplicada

| Origem | Destino |
| --- | --- |
| `frontend/src/App.jsx` | `frontend/src/app/App.jsx` |
| `frontend/src/index.css` | `frontend/src/styles/global.css` |
| `frontend/public/assets/logo.png` | `frontend/src/assets/images/logo.png` |
| `frontend/public/assets/weblogo.svg` | `frontend/src/assets/images/weblogo.svg` |
| `frontend/public/assets/applogo.svg` | `frontend/public/favicon.svg` |

O `App.css` vazio foi removido. O logo saiu do elemento inválido no `head`
e passou a ser exibido pelo componente `Header`, usando a versão horizontal.
