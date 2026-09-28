# Arquitetura do SaúdePlus

O repositório mantém duas aplicações: `frontend/` (React + Vite) e
`backend/` (Java 21 + Spring Boot 4.1.1 + Maven). Cada aplicação deve manter suas
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

O back-end segue a estrutura Maven e mantém as funcionalidades em pacotes Java
sob `br.com.saudeplus`. `SaudePlusApplication` fica no pacote raiz para que o
Spring encontre os componentes adicionados nos subpacotes.

```text
backend/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .mvn/wrapper/
└── src/
    ├── main/
    │   ├── java/br/com/saudeplus/
    │   │   ├── SaudePlusApplication.java
    │   │   ├── config/
    │   │   ├── security/
    │   │   ├── exception/
    │   │   ├── auth/
    │   │   ├── profissionais/
    │   │   ├── clinicas/
    │   │   ├── exames/
    │   │   └── agendamentos/dto/
    │   └── resources/
    │       ├── application.yml
    │       └── db/migration/
    └── test/java/br/com/saudeplus/
        └── SaudePlusApplicationTests.java
```

Dentro de cada domínio, os controllers receberão HTTP, os services concentrarão
regras de negócio, os repositories acessarão a persistência e os DTOs definirão
os contratos da API. Essas classes serão criadas conforme as funcionalidades.
`config`, `security` e `exception` reservam espaço para configuração, segurança
e tratamento compartilhado de erros.

A base inclui Spring MVC, Bean Validation, Spring Data JPA, Spring Security
com JWT e um banco H2 em memória (populado por `security/DataSeeder` ao
subir a aplicação). Os endpoints de negócio (autenticação, usuários,
clínicas, profissionais, exames e agendamentos) já estão implementados
com CRUD completo — veja o contrato em [docs/api.md](api.md).
`db/migration` continua reservada para quando o projeto migrar de
`ddl-auto: update` para migrações versionadas com Flyway. Instruções de
execução em [backend/README.md](../backend/README.md).

O front-end consome a API por HTTP; não acessa o banco diretamente. Autorização e
regras de disponibilidade devem ser garantidas no servidor e no banco quando
implementados. Segredos não pertencem ao código enviado ao navegador.

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
