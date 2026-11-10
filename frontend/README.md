# Front-end SaúdePlus

Aplicação React + Vite. Execute os comandos nesta pasta:

```sh
npm ci
npm run dev
```

O `package-lock.json` já está sincronizado com o `package.json` (inclui o
`react-router-dom`), então `npm ci` funciona. Use `npm install` apenas quando for
adicionar ou atualizar alguma dependência.

Verificações e build de produção:

```sh
npm run lint
npm test
npm run build
npm run preview
```

No PowerShell com execução de scripts desabilitada, utilize `npm.cmd` no lugar de `npm`.

A homepage fica em `src/features/home/pages/Home.jsx`, utilizando o cabeçalho
de `src/layouts/` e os componentes compartilhados de `src/components/`.
Os estilos usam CSS Modules e os tokens de `src/styles/tokens.css`.
Imagens e conteúdo demonstrativo foram adaptados da referência fornecida.
As páginas de Especialidades, Busca, Como funciona, Sobre nós e Ajuda estão
integradas com React Router. A busca de profissionais vem da API
(`/api/publico/*`); perguntas frequentes e textos institucionais são locais.
Cada profissional tem uma página de perfil (`/profissionais/:id`) com
horários livres, unidades, convênios e avaliações. "Agendar consulta" (no
perfil ou no cartão da busca) leva a `/paciente/consultas?agendar=<id>`, que
abre o agendamento com o profissional, e o dia e horário se escolhidos, já
preenchidos. Sem login, a pessoa passa pelo login ou cadastro e volta para lá
(`features/auth/destinoPendente.js`). Com a API fora do ar, os cartões de
demonstração e o suporte exibem um aviso de indisponibilidade.

Rotas públicas: `/`, `/especialidades`, `/buscar`, `/profissionais/:id`, `/como-funciona`, `/sobre-nos` e `/ajuda`.
A busca aceita `q`, `especialidade`, `cidade` (`"Cidade - UF"`) e `tipo` na URL.
Em produção, configure o servidor para devolver `index.html` nas rotas da aplicação,
permitindo abrir ou atualizar os endereços diretamente.

`npm test` (arquivos em `scripts/*.test.mjs`) verifica:

- `pages`: a renderização das rotas públicas e a estrutura do layout;
- `busca`: as regras da busca de profissionais (URL → filtros → parâmetros da
  API, resposta → cartão e o filtro local usado sem API);
- `perfil`: o perfil do profissional, o link de agendamento e a volta ao
  destino depois do login;
- `dom`: telas montadas num DOM de verdade (jsdom) com uma API falsa: busca com
  e sem API, perfil, destaques e o fluxo "Agendar" → login → agendamento
  preenchido → reserva. O ambiente fica em `scripts/dom-ambiente.mjs`
  (`apiFalsa`, `renderizar`, `esperar`, `clicar`, `digitar`);
- `adaptadores`: a conversão das respostas da API para as telas do paciente e
  da administração;
- `medico`: o painel do médico.

A revisão visual deve ser feita no navegador.

Consulte [a arquitetura](../docs/arquitetura.md) para saber onde adicionar componentes,
páginas, estilos e integrações.

## A API

O back-end fica em [`../backend`](../backend/README.md) (Java + Spring Boot).
Suba-o antes do `npm run dev`; o Vite faz proxy de `/api` para
`http://localhost:8080`, sem configurar URL nem lidar com CORS.

Com a API fora do ar:

- login e cadastro mostram *"Não foi possível falar com o servidor. Verifique se
  a API está no ar e tente novamente."*;
- a busca e as áreas logadas mostram dados de demonstração com uma faixa de
  aviso, e as ações (agendar, salvar, exportar…) ficam desligadas.

Para apontar para outro servidor, defina `VITE_API_URL` com a URL **sem** o
`/api` (lida por `src/services/http.js`; ver `.env.example`), por exemplo
`VITE_API_URL=https://api.exemplo.com`. Nesse caso, a origem do front precisa
estar liberada no CORS do back-end (`saudeplus.cors.origens`).

As rotas estão documentadas em [docs/api.md](../docs/api.md) e nos
`docs/api-*.md` de cada área.

## Rotas

| Rota | Acesso |
| --- | --- |
| `/login` | pública; redireciona quem já está logado |
| `/cadastro` | pública; cria apenas conta de **paciente** |
| `/recuperar-senha` | pública; pede o link de redefinição |
| `/redefinir-senha?token=...` | aberta a qualquer um — é o destino do link do e-mail |
| `/paciente/*`, `/medico`, `/admin/*` | exigem o perfil correspondente (painéis reais do paciente, médico e admin) |

Médico e equipe não se cadastram: são criados pela administração, e as contas
iniciais de admin e médico nascem com o servidor. As credenciais de
desenvolvimento estão em [docs/api.md](../docs/api.md).

`RotaProtegida` e `SomenteVisitante` são conveniência de navegação. A autorização
de verdade tem que ser a do servidor.

## Onde está o quê

- `src/features/auth/`: telas de autenticação, contexto de sessão e chamadas à API.
  - `pages/`: `Login.jsx`, `Cadastro.jsx`, `RecuperarSenha.jsx` e `RedefinirSenha.jsx`.
  - `components/`: `CartaoAuth.jsx` (moldura de página inteira), `CampoFormulario.jsx`,
    `EstadoResultado.jsx` (telas de sucesso/erro), `Icones.jsx` e `auth.css`.
  - `AuthProvider.jsx` + `auth.context.js`: usuário autenticado disponível na aplicação toda.
    O cadastro não abre a sessão sozinho — `aplicarSessao` é chamado quando o usuário
    sai da tela de "conta criada com sucesso", senão o redirecionamento engoliria a mensagem.
- `src/features/paciente/`, `medico/`, `admin/`: as chamadas à API de cada
  área (`*.api.js`), os adaptadores de resposta e os componentes "conectados"
  que ligam as telas à API.
- `src/features/profissionais/`: busca pública e perfil do profissional
  (`profissionais.api.js`, `buscaParametros.js`, `perfil.js`,
  `pages/PerfilProfissional.jsx`) e os dados de demonstração.
- `src/services/http.js`: wrapper de `fetch` com o token, o formato de erro da
  API e o download de arquivos (`baixarArquivo`).
- `src/services/sessaoStorage.js`: guarda o token. Com "Lembrar de mim" vai para o
  `localStorage`; sem, para o `sessionStorage` e some ao fechar a aba.
- `src/styles/global.css`: tokens de cor, tipografia e reset.
- `src/assets/images/wordmark.svg`: recorte do logotipo oficial usado nas telas de auth.

## Layout

As telas de autenticação ocupam a página inteira: barra no topo atravessando toda
a largura e o formulário numa coluna centralizada de 460px. A coluna existe para
que campos e linhas de texto não estiquem em monitores largos; o fundo branco vai
de borda a borda.

## Recuperação de senha

A tela `/recuperar-senha` pede o link e a `/redefinir-senha?token=...` grava a nova
senha. O envio do e-mail e a geração do token são responsabilidade da API; o fluxo
esperado está descrito em [docs/api.md](../docs/api.md).

Sem SMTP, o back-end escreve o link no log do servidor: copie de lá e abra no
navegador. Sem o parâmetro `token`, a tela mostra de propósito o estado "Link inválido".

## Telas conectadas das áreas logadas

- Médico: agenda diária, criação/edição/remoção de horários, bloqueios com
  confirmação de cancelamento, consultas e atendimento, pacientes e prontuário,
  exames, unidades, notificações e edição da conta e do perfil profissional.
- Paciente: informações pessoais, convênio, senha e notificações, além dos
  agendamentos, exames e histórico do painel.
- Administração: edição de usuários e clínicas (incluindo CNPJ e e-mail),
  fila de exames com coleta e envio de resultado, notificações, convênios,
  formas de pagamento, informações do sistema e auditoria.

As novas telas do médico e de perfil/notificações do paciente exibem o erro e
permitem tentar novamente quando a API falha. Os testes de interação em
`scripts/telas-conectadas.test.mjs` usam uma API simulada para verificar
edição de horários, bloqueios, perfil, notificações, coleta e teclado nos modais.
Execute `npm test`, `npm run lint` e `npm run build` em `frontend/`.

## Pendências conhecidas

Login com Google/Apple depende de uma API: os botões estão no layout e avisam que
o recurso está por vir. Ao ligar o OAuth, substitua o texto dos botões
pelos arquivos de marca oficiais do Google e da Apple — as duas empresas exigem o
logotipo oficial nesses botões.

Consulte [a arquitetura](../docs/arquitetura.md) e o [contrato da API](../docs/api.md).
