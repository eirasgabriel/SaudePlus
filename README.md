## 🩺 SaúdePlus

O SaúdePlus é um sistema Web/Mobile de agendamento de consultas e exames médicos, projetado e desenvolvido para facilitar a conexão entre pacientes, profissionais, clínicas, hospitais, oferecendo uma experiência simples, rápida e organizada para o gerenciamento de consultas.

> 🚧 **Status do Projeto:** Em desenvolvimento.

---
## 📋 Sobre o Projeto

O sistema tem como objetivo principal trazer mais acessibilidade à saúde a cada um que deseja cuidar um pouco mais de si mesmo, além de modernizar e simplificar o processo de agendamento e gerenciamento de consultas e exames médicos.

A plataforma permite que os pacientes encontrem profissionais, especialidades, clínicas, consulte horários e agende sua consulta remotamente, facilitando o processo de modo que acabe com problemas relacionados à acessibilidade à saúde dentro do nosso país. 

---
## Equipe do Projeto: 
A nossa equipe é composta de 6 Alunos de Engenharia de Software, da Universidade de Vassouras. 

> [Ana Júlia da Silva](https://github.com/AnaSoftEng) - <br> 
> [Danielle Gil Silva](https://github.com/Daniellesilva-7) - <br>
> [Fabricio Lima Galisa](https://github.com/backgroundGalisa) - <br>
> [Gabriel J. Eiras](https://github.com/eirasgabriel) - <br> 
> [Gabriel P. Marins Moreira](https://github.com/moreira-2203) - <br>
> [Raissa Queiroz](https://github.com/Raissaqueirozz) - <br>
---


## ✨ Funcionalidades esperadas para o Sistema

### 👤 Pacientes

* 🔐 Cadastro e autenticação de usuários
* 👤 Gerenciamento de dados pessoais e perfil
* 🔎 Busca por especialidades, profissionais, clínicas e exames
* 📍 Busca por localização e unidades de atendimento
* 🩺 Visualização de informações de profissionais e clínicas
* 🧪 Catálogo de exames disponíveis
* 📅 Consulta de dias e horários disponíveis
* 🩺 Agendamento de consultas
* 🧪 Agendamento de exames
* 🔄 Reagendamento de consultas e exames
* ❌ Cancelamento de agendamentos
* 📋 Visualização de agendamentos futuros e histórico
* 📄 Visualização de informações e orientações para realização de exames
* 🔔 Notificações e lembretes de consultas e exames
* ⭐ Avaliação de profissionais, clínicas e serviços
* 📆 Integração com calendário pessoal

### 👨‍⚕️ Profissionais de Saúde

* 🔐 Autenticação e gerenciamento de conta
* 👤 Gerenciamento do perfil profissional
* 🩺 Cadastro de especialidades e áreas de atuação
* 📅 Configuração de agenda e horários disponíveis
* 🚫 Bloqueio de datas e horários
* 📋 Visualização e gerenciamento de consultas
* 🔄 Confirmação, reagendamento e cancelamento de atendimentos
* 🔔 Notificações sobre novos agendamentos
* 📊 Histórico de atendimentos

### 🏥 Clínicas e Laboratórios

* 🏢 Cadastro e gerenciamento da unidade
* 👨‍⚕️ Gerenciamento de profissionais
* 🧪 Cadastro e gerenciamento de exames
* 💰 Definição de valores e condições de atendimento
* 📅 Gerenciamento de agendas
* ⏰ Configuração de horários para consultas e exames
* 🚫 Bloqueio de datas, horários e períodos
* 📋 Gerenciamento de agendamentos
* 👥 Controle de usuários e permissões
* 📊 Dashboard administrativo
* 📈 Relatórios de consultas, exames e atendimentos

### 🧪 Exames

* 🔎 Catálogo de exames disponíveis
* 📋 Informações detalhadas sobre cada exame
* 🏥 Seleção da unidade para realização
* 📅 Seleção de data e horário
* 📄 Exibição de preparo e orientações
* 🔄 Reagendamento de exames
* ❌ Cancelamento de exames
* 📋 Histórico de exames realizados ou agendados

### 🔔 Notificações

* 📅 Confirmação de agendamentos
* ⏰ Lembretes automáticos
* 🔄 Avisos de alterações e reagendamentos
* ❌ Notificações de cancelamento
* 🧪 Orientações e lembretes relacionados ao preparo de exames

### 🛠️ Administração

* 👥 Gerenciamento de usuários
* 🔐 Controle de acesso por perfil
* 🩺 Gerenciamento de especialidades
* 🏥 Gerenciamento de clínicas e unidades
* 👨‍⚕️ Gerenciamento de profissionais
* 🧪 Gerenciamento de exames
* 📊 Dashboard geral da plataforma
* 📈 Relatórios e indicadores
* 📝 Registro de atividades e alterações
* ⚙️ Configurações gerais do sistema

---

## Stack técnica

> **Front-end:** React 19 + Vite + React Router <br>
> **Back-end:** Java 21 + Spring Boot 4 (Spring Security, JPA/Hibernate) <br>
> **Banco de dados:** PostgreSQL 17, com migrações Flyway <br>
> **Autenticação:** JWT (HS256) no cabeçalho `Authorization`, com perfis e permissões por módulo <br>
> **Documentação da API:** Swagger em `/swagger-ui.html` (perfil `dev`) e os arquivos de [docs/](docs/) <br>
> **Mobile:** ainda não iniciado <br>

## O que já funciona

A aplicação roda de ponta a ponta: o front-end chama a API, e a API grava tudo
no PostgreSQL.

- **Visitante:** homepage, páginas institucionais, busca de profissionais com
  filtros e horários livres reais, perfil do profissional (horários, unidades,
  convênios e avaliações), cadastro, login e recuperação de senha. "Agendar"
  leva ao login e volta para o agendamento já preenchido.
- **Paciente:** painel, agendar, remarcar e cancelar consultas, histórico,
  avaliação de profissionais, exames com preparo e download do resultado,
  notificações e pagamentos.
- **Profissional de saúde:** painel do dia, agenda com as transições de status,
  registro do atendimento, pacientes, pedido de exames, janelas de atendimento
  e bloqueios de agenda.
- **Administração:** dashboard, usuários (é aqui que se cria médico e equipe),
  clínicas, catálogos, agendamentos, fila de exames com envio de resultado,
  financeiro, relatórios com exportação em PDF/CSV, configurações, matriz de
  permissões e auditoria.

Se a API estiver fora do ar, as telas mostram dados de demonstração com um
aviso, em vez de quebrar.

Ainda não existem: envio real de e-mail (o conteúdo sai no log do servidor),
gateway de pagamento, login com Google/Apple, a tela de suporte e o app mobile.

## Como rodar

Pré-requisitos: **JDK 21**, **Node.js 20.19+ ou 22.13+** (exigido pelo Vite 8 e pelo jsdom dos testes) e **Docker Desktop** rodando.

```powershell
# terminal 1: API na porta 8080 (sobe o PostgreSQL pelo Docker)
cd backend
.\mvnw.cmd spring-boot:run

# terminal 2: front-end na porta 5173
cd frontend
npm ci
npm run dev
```

Abra http://localhost:5173. Contas de desenvolvimento:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administração | `admin@saudeplus.com` | `Admin@SaudePlus2026` |
| Profissional | `medico@saudeplus.com` | `Medico@SaudePlus2026` |
| Paciente de demonstração | `ana.ferreira@demo.saudeplus.com` | `Demo@SaudePlus2026` |

Ou crie um paciente na tela **Criar conta**. Detalhes, variáveis de ambiente e
testes estão em [backend/README.md](backend/README.md) e
[frontend/README.md](frontend/README.md).

### Perfis e acesso

| Perfil | Como a conta é criada |
| --- | --- |
| Paciente | cadastro público na tela **Criar conta** |
| Profissional de saúde | pela administração, em **Usuários** (a conta inicial nasce com o servidor) |
| Equipe (gestor, enfermeiro, recepcionista, agente) | pela administração; vê só os módulos liberados na matriz de permissões |
| Administração | conta inicial criada pelo servidor, ou pela administração |

Todos entram pela mesma tela de login. Quem decide o acesso é o servidor; as
proteções de rota do React são só navegação.

---

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [docs/arquitetura.md](docs/arquitetura.md) | organização do front-end e do back-end, e como eles conversam |
| [docs/banco-de-dados.md](docs/banco-de-dados.md) | modelo de dados, diagrama, o que o banco garante e evoluções previstas |
| [docs/api.md](docs/api.md) | autenticação, busca pública, formato de erro e autorização |
| [docs/api-area-paciente.md](docs/api-area-paciente.md) | rotas `/api/paciente/*` |
| [docs/api-painel-medico.md](docs/api-painel-medico.md) | rotas `/api/medico/*`, status de consulta e cálculo de horários |
| [docs/api-exames.md](docs/api-exames.md) | ciclo do exame, do pedido ao resultado |
| [docs/api-admin.md](docs/api-admin.md) | rotas `/api/admin/*`, permissões e auditoria |
| [docs/api-financeiro-relatorios.md](docs/api-financeiro-relatorios.md) | cobranças, resumo financeiro e exportação de relatórios |
| [docs/admin.md](docs/admin.md) | como a área administrativa do front está montada |
| [docs/dashboard-medico.md](docs/dashboard-medico.md) | como o painel do médico do front está montado |
