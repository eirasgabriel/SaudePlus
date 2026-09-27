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
integradas com React Router. Busca, filtros, ordenação e perguntas frequentes usam
dados locais demonstrativos. Os botões Entrar e Criar conta do cabeçalho levam a `/login` e `/cadastro`;
agendamento, perfil completo e suporte exibem um aviso de indisponibilidade. Nenhum agendamento é enviado ao servidor.

Rotas: `/`, `/especialidades`, `/buscar`, `/como-funciona`, `/sobre-nos` e `/ajuda`.
A busca aceita `q`, `especialidade`, `profissional`, `cidade` e `tipo` na URL.
Em produção, configure o servidor para devolver `index.html` nas rotas da aplicação,
permitindo abrir ou atualizar os endereços diretamente.

`npm test` verifica a renderização das rotas, a estrutura do layout, os parâmetros
de busca e estados sem resultados. A revisão visual deve ser feita no navegador.

Consulte [a arquitetura](../docs/arquitetura.md) para saber onde adicionar componentes,
páginas, estilos e integrações. A base do back-end usa Java + Spring Boot; os endpoints ainda não estão implementados.
## A API

**O back-end ainda não tem os endpoints de autenticação.** As telas de login chamam
`/api/auth/*`, então, enquanto essa parte da API não existir, entrar ou cadastrar
mostra:

> Não foi possível falar com o servidor. Verifique se a API está no ar e tente novamente.

Isso é o comportamento esperado, não um defeito: as telas, as rotas, as validações
e as mensagens funcionam normalmente. O contrato que a API precisa cumprir — rotas,
corpos, códigos de erro e as contas fixas de médico e admin — está em
[docs/api.md](../docs/api.md).

O Vite faz proxy de `/api` para `http://localhost:8080`, então qualquer API que
rode nessa porta já é encontrada, sem configurar URL nem lidar com CORS. Para
apontar para outro endereço, defina `VITE_API_URL` (lida por `src/services/http.js`)
— por exemplo `VITE_API_URL=https://api.exemplo.com/api`. Nesse caso, a API precisa
liberar a origem do front no CORS.

## Rotas

| Rota | Acesso |
| --- | --- |
| `/login` | pública; redireciona quem já está logado |
| `/cadastro` | pública; cria apenas conta de **paciente** |
| `/recuperar-senha` | pública; pede o link de redefinição |
| `/redefinir-senha?token=...` | aberta a qualquer um — é o destino do link do e-mail |
| `/paciente/*`, `/medico`, `/admin/*` | exigem o perfil correspondente (painéis reais do paciente, médico e admin) |

Médico e admin não se cadastram: entram pelo `/login` com contas que a API precisa
criar na inicialização. As credenciais combinadas estão em
[docs/api.md](../docs/api.md).

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
- `src/services/http.js`: wrapper de `fetch` com o formato de erro da API.
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

Para ver a tela `/redefinir-senha` sem uma API no ar, abra-a com qualquer token na
URL, por exemplo `http://localhost:5173/redefinir-senha?token=teste`. Sem o
parâmetro `token`, ela mostra de propósito o estado "Link inválido".

## Pendências conhecidas

Login com Google/Apple depende de uma API: os botões estão no layout e avisam que
o recurso está por vir. Ao ligar o OAuth, substitua o texto dos botões
pelos arquivos de marca oficiais do Google e da Apple — as duas empresas exigem o
logotipo oficial nesses botões.

Consulte [a arquitetura](../docs/arquitetura.md) e o [contrato da API](../docs/api.md).
