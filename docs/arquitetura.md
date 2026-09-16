# Arquitetura do SaúdePlus

O repositório mantém duas aplicações: `frontend/` (React + Vite) e
`backend/` (ainda sem framework definido). Cada aplicação deve manter suas
dependências, configurações e comandos em sua própria pasta.

## Front-end

- `src/main.jsx`: inicialização do React e importação do CSS global.
- `src/app/`: composição da aplicação. Adicionar rotas e providers quando necessários.
- `src/layouts/`: estruturas compartilhadas de página e cabeçalho.
- `src/components/`: componentes usados por diferentes funcionalidades.
- `src/features/`: código organizado por domínio: auth, profissionais, clinicas,
  exames e agendamentos. Criar `pages/`, `components/` e `hooks/` dentro de cada
  funcionalidade quando houver implementação para eles.
- `src/services/`: infraestrutura compartilhada de acesso HTTP; criar `http.js`
  quando a integração com a API começar. Operações específicas pertencem à
  funcionalidade, por exemplo `features/agendamentos/agendamentos.api.js`.
- `src/assets/images/`: imagens importadas pelos componentes.
- `src/styles/global.css`: estilos globais; estilos de componentes ficam próximos deles.
- `public/`: arquivos servidos diretamente, como o favicon.

`index.html`, `vite.config.js`, `eslint.config.js` e `package*.json` permanecem
na raiz de `frontend/`. Não mover `index.html` para `public/`.

## Back-end

A estrutura é preparatória, sem API executável ou escolha de linguagem/framework.

- `src/config/`: leitura e validação da configuração do servidor.
- `src/database/migrations/`: evolução versionada do banco, quando escolhido.
- `src/middlewares/`: tratamento transversal das requisições.
- `src/modules/`: funcionalidades agrupadas pelos mesmos domínios do front-end.
- `tests/`: testes de integração da API e persistência quando implementadas.

Dentro de um módulo, separar entrada HTTP (rotas/controladores), regras de negócio
(serviços), persistência (repositórios) e validação de entrada conforme as convenções
do framework escolhido. Não criar camadas vazias de código antecipadamente.

O front-end consome a API; não acessa o banco diretamente. Autorização e regras
como disponibilidade de horários devem ser garantidas no servidor e no banco.
Segredos pertencem à configuração do back-end, nunca ao código enviado ao navegador.

As pastas ainda sem implementação possuem `.gitkeep` para serem versionadas.
Remover esses marcadores quando as pastas receberem arquivos reais.

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
