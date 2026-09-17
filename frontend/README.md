# Front-end SaúdePlus

Aplicação React + Vite. Execute os comandos nesta pasta:

```sh
npm ci
npm run dev
```

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
dados locais demonstrativos. Autenticação, agendamento, perfil completo e suporte
exibem um aviso de indisponibilidade. Nenhum agendamento ou cadastro é enviado ao servidor.

Rotas: `/`, `/especialidades`, `/buscar`, `/como-funciona`, `/sobre-nos` e `/ajuda`.
A busca aceita `q`, `especialidade`, `profissional`, `cidade` e `tipo` na URL.
Em produção, configure o servidor para devolver `index.html` nas rotas da aplicação,
permitindo abrir ou atualizar os endereços diretamente.

`npm test` verifica a renderização das rotas, a estrutura do layout, os parâmetros
de busca e estados sem resultados. A revisão visual deve ser feita no navegador.

Consulte [a arquitetura](../docs/arquitetura.md) para saber onde adicionar componentes,
páginas, estilos e integrações. A base do back-end usa Java + Spring Boot; os endpoints ainda não estão implementados.
