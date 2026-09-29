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

## Stack Técnica do Projeto - 

> **Front-End:** React + Vite.js + React Router <br>
> **Back-End:** Java 21 + Spring Boot 4 + Spring Security (JWT) — pasta [backend/](backend/README.md) <br>
> **Banco de Dados:** H2 em arquivo (desenvolvimento) ou PostgreSQL, com migrations Flyway <br> 
> **Mobile:** <br>
> **Autenticação:** JWT via cabeçalho `Authorization` — contrato em [docs/api.md](docs/api.md) <br>
> **Cache:** <br>

### O que já existe

- **Front-end** (`frontend/`): Login, Criar conta, Recuperar senha e Nova senha, com
  validação, mensagens e proteção de rotas por perfil.
- **Back-end** (`backend/`): API de autenticação em `/api/auth/*` (cadastro de
  paciente, login, recuperação e redefinição de senha, perfil), JWT, autorização por
  perfil e contas fixas de médico e admin criadas na inicialização. Contrato em
  [docs/api.md](docs/api.md).

Para rodar: suba a API (`cd backend && ./mvnw spring-boot:run`) e o front
(`cd frontend && npm install && npm run dev`). Profissionais, clínicas, exames e
agendamentos ainda não têm endpoints.

### Perfis e acesso

| Perfil | Como a conta é criada |
| --- | --- |
| Paciente | cadastro público na tela **Criar conta** |
| Profissional de saúde | conta única criada pelo servidor na inicialização — **não há cadastro** |
| Administração | conta única criada pelo servidor na inicialização — **não há cadastro** |

Os três entram pela mesma tela de login. As credenciais combinadas para médico e
admin estão em [docs/api.md](docs/api.md).


---

## Design Arquitetural do Projeto - 






Consulte a [organização de pastas e responsabilidades](docs/arquitetura.md) e o [contrato da API](docs/api.md).
