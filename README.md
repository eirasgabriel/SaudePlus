# SaúdePlus

Sistema web de agendamento de consultas e exames médicos, que integra pacientes, profissionais de saúde e clínicas em uma única plataforma.

**Status:** MVP em desenvolvimento. A aplicação web funciona de ponta a ponta; o aplicativo mobile ainda não foi iniciado.

## Sumário

1. [Sobre o projeto](#sobre-o-projeto)
2. [Funcionalidades implementadas](#funcionalidades-implementadas)
3. [Tecnologias](#tecnologias)
4. [Execução local](#execução-local)
5. [Contas de desenvolvimento](#contas-de-desenvolvimento)
6. [Perfis e controle de acesso](#perfis-e-controle-de-acesso)
7. [Testes](#testes)
8. [Estrutura do repositório](#estrutura-do-repositório)
9. [Documentação técnica](#documentação-técnica)
10. [Limitações e próximos passos](#limitações-e-próximos-passos)
11. [Equipe](#equipe)

## Sobre o projeto

O SaúdePlus tem como objetivo ampliar o acesso à saúde e simplificar o processo de agendamento. O paciente localiza profissionais, especialidades e clínicas, consulta horários efetivamente disponíveis e agenda o atendimento remotamente. Profissionais e clínicas gerenciam agendas, atendimentos, exames e informações financeiras na mesma plataforma.

O projeto é desenvolvido como trabalho acadêmico do curso de Engenharia de Software da Universidade de Vassouras.

## Funcionalidades implementadas

### Visitante

- Página inicial e páginas institucionais.
- Busca de profissionais com filtros e horários livres calculados pela API.
- Perfil do profissional com horários, unidades, convênios e avaliações.
- Cadastro, login e recuperação de senha.
- Ao selecionar "Agendar" sem estar autenticado, o usuário é direcionado ao login e retorna ao agendamento com os dados preenchidos.

### Paciente

- Painel pessoal.
- Agendamento, remarcação e cancelamento de consultas.
- Histórico de atendimentos.
- Avaliação de profissionais.
- Exames com orientações de preparo e download do resultado.
- Notificações e pagamentos.

### Profissional de saúde

- Painel com os atendimentos do dia.
- Agenda com controle de status das consultas.
- Registro do atendimento.
- Lista de pacientes e solicitação de exames.
- Configuração de janelas de atendimento e bloqueios de agenda.

### Administração

- Painel geral da plataforma.
- Gestão de usuários, incluindo o cadastro de profissionais e equipe.
- Gestão de clínicas, unidades e catálogos (especialidades, convênios e formas de pagamento).
- Gestão de agendamentos e fila de exames, com envio de resultados.
- Módulo financeiro e relatórios com exportação em PDF e CSV.
- Configurações do sistema, matriz de permissões e auditoria.

Caso a API esteja indisponível, as telas exibem dados de demonstração acompanhados de um aviso, sem interromper a navegação.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Front-end | React 19, Vite 8, React Router 7, CSS Modules |
| Back-end | Java 21, Spring Boot 4 (Web MVC, Security, Data JPA, Validation) |
| Banco de dados | PostgreSQL 17, com migrações gerenciadas pelo Flyway |
| Autenticação | JWT (HS256) enviado no cabeçalho `Authorization`, com perfis e permissões por módulo |
| Documentação da API | OpenAPI/Swagger, disponível em `/swagger-ui.html` no perfil `dev` |
| Relatórios | OpenPDF (PDF) e exportação em CSV |
| Testes | JUnit e Testcontainers (back-end); `node --test` com jsdom (front-end) |

## Execução local

### Pré-requisitos

- JDK 21
- Node.js 20.19+ ou 22.13+ (versões exigidas pelo Vite 8 e pelo jsdom)
- Docker Desktop em execução

### Back-end e front-end

```powershell
# Terminal 1: API na porta 8080 (o PostgreSQL é iniciado automaticamente via Docker)
cd backend
.\mvnw.cmd spring-boot:run

# Terminal 2: front-end na porta 5173
cd frontend
npm ci
npm run dev
```

Em Linux ou macOS, utilize `sh ./mvnw spring-boot:run`.

Após a inicialização, acesse `http://localhost:5173`.

### Alternativa com Docker Compose

O arquivo `docker-compose.yml` na raiz sobe o banco de dados e a API no perfil `dev`:

```bash
docker compose up --build
```

O front-end continua sendo executado separadamente com `npm run dev`.

### Variáveis de ambiente

- **Front-end:** copie `frontend/.env.example` para `frontend/.env`. Com `VITE_API_URL` vazio, o Vite redireciona as chamadas `/api` para `http://localhost:8080`.
- **Back-end:** a lista completa está em [backend/README.md](backend/README.md).

## Contas de desenvolvimento

As contas abaixo são criadas automaticamente quando o back-end é iniciado no perfil `dev`:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administração | `admin@saudeplus.com` | `teste@saudeplus` |
| Profissional | `medico@saudeplus.com` | `teste@saudeplus` |
| Paciente | `paciente@saudeplus.com` | `teste@saudeplus` |

Observações:

- As credenciais podem ser substituídas pelas variáveis `SEED_*`.
- Contas já existentes mantêm a senha e o status salvos, mesmo após reiniciar o servidor.
- O front-end não autentica sem a API e o banco de dados em execução.
- Novos pacientes podem ser cadastrados pela tela **Criar conta**.

Essas credenciais destinam-se exclusivamente ao ambiente de desenvolvimento e não são carregadas no perfil `prod`.

## Perfis e controle de acesso

| Perfil | Forma de criação da conta |
| --- | --- |
| Paciente | Cadastro público na tela **Criar conta** |
| Profissional de saúde | Pela administração, no módulo **Usuários** |
| Equipe (gestor, enfermeiro, recepcionista, agente) | Pela administração, com acesso restrito aos módulos liberados na matriz de permissões |
| Administração | Conta inicial criada pelo servidor ou cadastrada pela administração |

Todos os perfis utilizam a mesma tela de login. O controle de acesso é aplicado no servidor; as rotas protegidas do front-end servem apenas à navegação.

## Testes

```powershell
# Back-end (requer Docker em execução): testes de integração e empacotamento
cd backend
.\mvnw.cmd verify

# Front-end: testes e análise estática
cd frontend
npm test
npm run lint
```

## Estrutura do repositório

```
SaudePlus/
├── backend/              API Spring Boot, organizada em pacotes por domínio
├── frontend/             Aplicação React + Vite
│   ├── scripts/          testes automatizados do front-end
│   └── src/
│       ├── app/          rotas e estrutura principal da aplicação
│       ├── components/   componentes reutilizáveis
│       ├── features/     módulos por área (auth, paciente, medico, admin, exames etc.)
│       ├── layouts/      layouts e navegação
│       └── services/     comunicação com a API
├── docs/                 documentação de arquitetura, banco de dados e API
└── docker-compose.yml    banco de dados e API para ambiente local
```

## Documentação técnica

| Documento | Conteúdo |
| --- | --- |
| [docs/arquitetura.md](docs/arquitetura.md) | Organização do front-end e do back-end e integração entre eles |
| [docs/banco-de-dados.md](docs/banco-de-dados.md) | Modelo de dados, diagrama, garantias do banco e evoluções previstas |
| [docs/api.md](docs/api.md) | Autenticação, busca pública, formato de erro e autorização |
| [docs/api-area-paciente.md](docs/api-area-paciente.md) | Rotas `/api/paciente/*` |
| [docs/api-painel-medico.md](docs/api-painel-medico.md) | Rotas `/api/medico/*`, status de consulta e cálculo de horários |
| [docs/api-exames.md](docs/api-exames.md) | Ciclo do exame, do pedido ao resultado |
| [docs/api-admin.md](docs/api-admin.md) | Rotas `/api/admin/*`, permissões e auditoria |
| [docs/api-financeiro-relatorios.md](docs/api-financeiro-relatorios.md) | Cobranças, resumo financeiro e exportação de relatórios |
| [docs/admin.md](docs/admin.md) | Estrutura da área administrativa no front-end |
| [docs/dashboard-medico.md](docs/dashboard-medico.md) | Estrutura do painel do médico no front-end |
| [backend/README.md](backend/README.md) | Variáveis de ambiente, dados iniciais e organização da API |
| [frontend/README.md](frontend/README.md) | Configuração e organização do front-end |

## Limitações e próximos passos

Ainda não implementado:

- Envio de e-mails depende de um servidor SMTP configurado (`SPRING_MAIL_*`); sem ele, o conteúdo é registrado no log.
- Integração com gateway de pagamento.
- Login com Google e Apple.
- Integração com calendário pessoal.
- Aplicativo mobile.

## Equipe

Alunos do curso de Engenharia de Software da Universidade de Vassouras:

| Nome | GitHub |
| --- | --- |
| Ana Júlia da Silva | [AnaSoftEng](https://github.com/AnaSoftEng) |
| Danielle Gil Silva | [Daniellesilva-7](https://github.com/Daniellesilva-7) |
| Fabricio Lima Galisa | [backgroundGalisa](https://github.com/backgroundGalisa) |
| Gabriel J. Eiras | [eirasgabriel](https://github.com/eirasgabriel) |
| Gabriel P. Marins Moreira | [moreira-2203](https://github.com/moreira-2203) |
| Raissa Queiroz | [Raissaqueirozz](https://github.com/Raissaqueirozz) |
