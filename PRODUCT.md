# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Pacientes**: procuram profissionais por especialidade/cidade, agendam consultas e exames, acompanham histórico, resultados, notificações e perfil.
- **Médicos**: gerenciam agenda do dia, consultas, pedidos e resultados de exames, prontuário dos pacientes vinculados, unidades e notificações.
- **Equipe da clínica** (ADMIN, GESTOR, ENFERMEIRO, RECEPCIONISTA, AGENTE): administram usuários, unidades, agendamentos, exames, financeiro, relatórios, configurações e suporte, com acesso por módulo.

## Product Purpose

SaúdePlus conecta a busca pública por profissionais de saúde ao agendamento e à gestão clínica em um único sistema: o mesmo dado que o paciente vê ao marcar é o que o médico atende e a equipe administra.

## Operating Context

Aplicação web (React/Vite) com áreas pública, paciente, médico e administração, consumindo uma API Spring. Fuso America/Sao_Paulo. Regras de agenda: antecedência mínima, janela de agendamento e prazo de cancelamento configuráveis. Ciclo de status de consulta: pendente → confirmada → aguardando → em andamento → realizada (ou cancelada/faltou). Exames aceitam laudos PDF/PNG/JPEG. App mobile previsto, fora deste repositório.

## Capabilities and Constraints

- Cadastro público cria somente paciente; médicos e equipe são criados pelo admin.
- Pagamentos são controle interno, sem gateway externo. E-mail ainda não envia SMTP real. OAuth Google/Apple e suporte constam como pendências.
- Algumas telas usam dados de demonstração quando a API está indisponível; não apresentar como dados reais.
- Testes de frontend (node --test) verificam estrutura e textos das telas: redesenhos não podem mudar rotas, dados, textos factuais nem comportamento.

## Brand Commitments

- Nome: SaúdePlus. Logo existente em `frontend/src/components/Logo/` e `src/assets/images/`.
- Paleta azul obrigatória (decisão do usuário, 08/11/2026): primário #0070E8 (azul da Cartilha Digital), marinho #020F45/#041A58/#042B78, ciano #44C6F4, fundo #F0F7FD, superfícies brancas. Redesenhos mantêm esta paleta.
- Idioma da interface: português do Brasil.

## Evidence on Hand

- Não há depoimentos, clientes, números de uso ou certificações reais. Não inventar estatísticas, avaliações ou selos.
- Fatos do produto na home vêm de `frontend/src/features/home/data/home.js`.

## Product Principles

1. Clareza antes de expressão nos painéis: a tarefa do dia (consulta, exame, cadastro) precisa ser encontrada em segundos.
2. Um só sistema visual nas quatro áreas: o paciente, o médico e a equipe reconhecem o mesmo produto.
3. Honestidade dos dados: estados de demonstração, vazio e erro são explícitos.
4. Acessível por padrão: público amplo, incluindo idosos e pessoas com baixa visão.

## Accessibility & Inclusion

WCAG 2.2 AA como piso: contraste 4.5:1 em texto, foco visível, alvos de toque adequados, respeito a prefers-reduced-motion. Público inclui pacientes idosos.
