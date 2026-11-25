# Pendências dos painéis

O que ainda não funciona nos painéis (admin, médico, paciente e clínica),
depois do patch de correções de novembro de 2026. Cada item diz o que falta e
o que já existe para começar.

## Financeiro: implementável (última etapa do projeto)

A parte financeira fica para o fim. O backend já tem o necessário para os
itens abaixo; falta a tela.

| Item | O que já existe | O que falta |
| --- | --- | --- |
| Dar baixa e estornar transação | `PATCH /api/admin/financeiro/transacoes/{id}/status` (`{ status: "pago", forma }` ou `{ status: "estornado" }`) e `alterarStatusDaTransacao` em `frontend/src/features/admin/admin.api.js` | Ações na tabela "Últimas Transações" (`AdminFinanceiroPage.jsx`) |
| Lançar transação manual | `POST /api/admin/financeiro/transacoes` (`pacienteId`, `agendamentoId?`, `descricao`, `valor`, `forma?`, `jaPago`) | Modal de lançamento com escolha do paciente; função no `admin.api.js` |
| Pagamentos do paciente | `GET /api/paciente/pagamentos` (lista de `TransacaoResposta`) | Tela `/paciente/pagamentos` e item no menu do paciente |
| Mais de 50 transações por período | O servidor aceita `tamanho` até 500 e devolve `totalElementos` | Paginar ou subir o `tamanho` em `listarTransacoes` e avisar quando a lista não traz tudo |
| Nota fiscal | Nada | Integração com a prefeitura/SEFAZ |

## Dependem de serviço externo ou infraestrutura

Aparecem como "Em breve" (sem fingir que funcionam):

- **Autenticação em dois fatores (2FA):** não existe no backend.
- **SMS, push, lembretes de consulta, horários de envio e modelos de mensagem:**
  só existem as notificações no sistema e o e-mail de recuperação de senha.
- **Integrações:** Google Calendar, WhatsApp e push.
- **Teleconsulta:** consultas na modalidade online não têm sala nem link de vídeo.
- **Backup e restauração:** feitos pelo provedor do banco, fora do sistema.
- **Chat de suporte com pessoas** (o chat do site é automático).

## Dependem de conteúdo ou decisão

- **Termos de uso e política de privacidade:** precisam de texto jurídico.
- **Vídeos tutoriais.**
- **Política de senhas configurável, dispositivos conectados e LGPD:** a senha
  mínima é fixa em 8 caracteres.
- **Logo do sistema:** falta upload e lugar para guardar o arquivo.
- **Idioma e fuso horário de Configurações > Geral:** são gravados, mas o
  sistema continua em pt-BR e no fuso configurado no servidor
  (`America/Sao_Paulo`).

## Baixa prioridade

- `GET /api/paciente/exames/{id}` (detalhe de um exame) não é usado: a lista
  de exames já traz o que a tela mostra.
