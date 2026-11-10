/* Dados fictícios da tela de Suporte. */

export const canais = [
  {
    id: "atendimento",
    titulo: "Atendimento ao Cliente",
    descricao: "Fale com a nossa equipe de suporte para tirar dúvidas e resolver problemas.",
    icone: "suporte",
    acao: { rotulo: "Abrir Chat", icone: "chat", variante: "primario" },
  },
  {
    id: "email",
    titulo: "E-mail de Suporte",
    descricao: "Envie um e-mail e receba um retorno da nossa equipe o mais breve possível.",
    icone: "email",
    acao: {
      rotulo: "suporte@saudeplus.com.br",
      icone: "email",
      variante: "secundario",
      href: "mailto:suporte@saudeplus.com.br",
    },
  },
  {
    id: "telefone",
    titulo: "Telefone",
    descricao: "Fale com um atendente de segunda a sexta, das 8h às 18h.",
    icone: "telefone",
    acao: {
      rotulo: "(22) 99876-5432",
      icone: "telefone",
      variante: "secundario",
      href: "tel:+5522998765432",
    },
  },
  {
    id: "chat",
    titulo: "Chat Online",
    descricao: "Atendimento rápido pelo nosso chat em tempo real.",
    icone: "chatDuplo",
    acao: { rotulo: "Iniciar Chat", icone: "chat", variante: "secundario" },
  },
];

export const perguntasFrequentes = [
  {
    id: "agendar",
    pergunta: "Como agendar uma consulta?",
    resposta:
      "Acesse o menu Agendamentos e clique em “Novo agendamento”. Escolha a unidade, a especialidade e o profissional, selecione um horário disponível e confirme. O paciente recebe a confirmação por e-mail e, se estiver ativo nas configurações, também por SMS ou WhatsApp.",
  },
  {
    id: "cancelar",
    pergunta: "Como cancelar ou remarcar um agendamento?",
    resposta:
      "Na lista de agendamentos, use o menu de ações (⋮) da linha desejada e escolha “Remarcar” ou “Cancelar”. O cancelamento exige um motivo, que passa a compor o Relatório de Cancelamentos. Remarcações mantêm o histórico do agendamento original.",
  },
  {
    id: "senha",
    pergunta: "Como recuperar minha senha?",
    resposta:
      "Na tela de login, clique em “Esqueci minha senha” e informe o e-mail cadastrado. O link de redefinição vale por 30 minutos. Se a autenticação em dois fatores estiver ativa, o segundo fator continua sendo solicitado após a troca.",
  },
  {
    id: "lembrete",
    pergunta: "O que fazer se não receber a notificação de lembrete?",
    resposta:
      "Verifique em Configurações › Notificações se o canal correspondente está ativo e se o horário de envio cobre o período do agendamento. Confirme também se o e-mail ou telefone do paciente está correto no cadastro e se a mensagem não caiu na caixa de spam.",
  },
  {
    id: "relatorio",
    pergunta: "Como emitir um relatório de atendimentos?",
    resposta:
      "Vá em Relatórios, ajuste o período e os filtros avançados (unidade, profissional, especialidade e status), escolha o formato de saída e clique em “Gerar relatório personalizado”. O arquivo fica disponível para download assim que o processamento termina.",
  },
  {
    id: "contato",
    pergunta: "Como entrar em contato com a clínica onde meu atendimento foi marcado?",
    resposta:
      "Abra o agendamento e clique no nome da unidade para ver telefone, endereço e horário de funcionamento. Os mesmos dados estão em Configurações › Clínicas e Unidades, no painel de detalhes de cada clínica.",
  },
];

export const horarioAtendimento = {
  titulo: "Nosso horário de atendimento",
  dias: "Segunda a sexta-feira",
  horas: "Das 8h às 18h",
};

export const linksUteis = [
  {
    id: "manual",
    titulo: "Manual do Usuário",
    descricao: "Guia completo do sistema",
    icone: "documento",
  },
  {
    id: "videos",
    titulo: "Vídeos Tutoriais",
    descricao: "Aprenda de forma prática",
    icone: "play",
  },
  {
    id: "termos",
    titulo: "Termos de Uso",
    descricao: "Regras e condições do sistema",
    icone: "documento",
  },
  {
    id: "privacidade",
    titulo: "Política de Privacidade",
    descricao: "Seus dados estão protegidos",
    icone: "escudoCheck",
  },
];
