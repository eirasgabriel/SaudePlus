# Arquitetura do SaúdePlus

O repositório mantém uma aplicação: `frontend/` (React + Vite). O back-end ainda
não existe aqui — o front conversa com ele por HTTP, e o contrato que essa API
precisa cumprir está em [api.md](api.md).

## Front-end

- `src/main.jsx`: inicialização do React, `BrowserRouter`, `AuthProvider` e CSS global.
- `src/app/App.jsx`: tabela de rotas da aplicação.
- `src/layouts/`: estruturas compartilhadas de página e cabeçalho.
- `src/components/`: componentes usados por diferentes funcionalidades.
- `src/features/`: código organizado por domínio: auth, profissionais, clinicas,
  exames e agendamentos. Criar `pages/`, `components/` e `hooks/` dentro de cada
  funcionalidade quando houver implementação para eles.
- `src/services/`: infraestrutura compartilhada de acesso HTTP; criar `http.js`
  quando a integração com a API começar. Operações específicas pertencem à
  funcionalidade, por exemplo `features/agendamentos/agendamentos.api.js`.
- `src/features/home/`: homepage, com composição em `pages/` e conteúdo de
  apresentação em `data/`. Os indicadores são dados demonstrativos do layout.
- `src/features/profissionais/`: especialidades e busca, dados demonstrativos e
  componentes específicos de profissionais e filtros.
- `src/features/institucional/`: páginas Como funciona e Sobre nós e seus conteúdos.
- `src/features/ajuda/`: central de ajuda, perguntas frequentes e canais de suporte.
- `src/app/App.jsx`: rotas públicas; `RouteEffects.jsx` atualiza título e foco na navegação.
  O `BrowserRouter` é inicializado em `src/main.jsx`.
- `src/styles/tokens.css`: cores, tipografia, espaçamento e medidas compartilhadas.
- `src/utils/`: utilitários compartilhados, como composição de classes CSS.
- `src/components/`: componentes usados por diferentes funcionalidades, como
  `RotaProtegida` e `SomenteVisitante`.
- `src/features/`: código organizado por domínio: auth, painel, profissionais,
  clinicas, exames e agendamentos. Criar `pages/`, `components/` e `hooks/` dentro
  de cada funcionalidade quando houver implementação para eles.
  - `features/auth/` já está implementada: Login, Criar conta, Recuperar senha e
    Nova senha, além de `auth.api.js`, `AuthProvider.jsx` e `auth.context.js`.
    As telas ocupam a página inteira; `CartaoAuth.jsx` é a moldura compartilhada.
  - As áreas por perfil são `/paciente/*`, `/medico` e `/admin/*` em `app/App.jsx`, todas atrás de `RotaProtegida`.
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

O back-end não faz parte deste repositório. O que ele precisa entregar está
especificado em [api.md](api.md): as rotas de `/api/auth/*`, os corpos de
requisição e resposta, o formato único de erro, os códigos HTTP e as contas fixas
de médico e admin que o servidor deve criar na inicialização.

A linguagem e o framework ficam em aberto. O que o front assume é só isto:

- respostas JSON em UTF-8;
- autenticação por JWT no cabeçalho `Authorization: Bearer <token>`;
- erros no formato `{ timestamp, status, erro, mensagem, campos? }`, onde `campos`
  mapeia nome do campo para a mensagem de validação — é o que destaca o input
  errado no formulário;
- CORS liberado para a origem do front.

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
