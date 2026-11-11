/* Dados fictícios da tela de Suporte. */

export const canais = [
  {
    id: "atendimento",
    titulo: "Atendimento ao Cliente",
    descricao: "Fale com a nossa equipe de suporte para tirar dúvidas e resolver problemas.",
    icone: "suporte",
    acao: { rotulo: "Abrir Chat", icone: "chat", variante: "primario", emBreve: "Chat de suporte" },
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
    acao: { rotulo: "Iniciar Chat", icone: "chat", variante: "secundario", emBreve: "Chat online" },
  },
];

export const perguntasFrequentes = [
  {
    id: "agendar",
    pergunta: "Como agendar uma consulta?",
    resposta:
      "Em Agendamentos, clique em “Novo agendamento”. Escolha o paciente, a especialidade, o profissional, a data e um horário livre, e confirme. O paciente vê a consulta no painel dele e recebe uma notificação. O próprio paciente também pode agendar pela área dele ou pela busca do site.",
  },
  {
    id: "cancelar",
    pergunta: "Como cancelar ou remarcar um agendamento?",
    resposta:
      "Na lista de Agendamentos, use o botão “Cancelar” da linha e confirme. A remarcação é feita pelo paciente, na área “Minhas consultas”, até 24 horas antes do horário. Com menos de 24 horas, o paciente precisa falar com a clínica.",
  },
  {
    id: "senha",
    pergunta: "Como recuperar minha senha?",
    resposta:
      "Na tela de login, clique em “Esqueci minha senha” e informe o e-mail cadastrado. O link de redefinição chega por e-mail e vale por 30 minutos.",
  },
  {
    id: "lembrete",
    pergunta: "Onde aparecem as notificações?",
    resposta:
      "No sino do cabeçalho de cada área (paciente, médico e administração) e na tela Notificações. Agendamentos, cancelamentos e resultados de exame geram uma notificação para quem precisa saber.",
  },
  {
    id: "relatorio",
    pergunta: "Como emitir um relatório de atendimentos?",
    resposta:
      "Vá em Relatórios, ajuste o período e os filtros e use os botões de exportação. O arquivo é baixado na hora.",
  },
  {
    id: "contato",
    pergunta: "Como ver os dados de contato de uma clínica?",
    resposta:
      "Em Clínicas, cada unidade mostra endereço, telefone e horário de funcionamento. O paciente vê as mesmas informações em “Clínicas”, na área dele.",
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
    titulo: "Central de Ajuda",
    descricao: "Perguntas frequentes do site",
    icone: "documento",
    para: "/ajuda",
  },
  {
    id: "videos",
    titulo: "Vídeos Tutoriais",
    descricao: "Aprenda de forma prática",
    icone: "play",
    emBreve: "Vídeos tutoriais",
  },
  {
    id: "termos",
    titulo: "Termos de Uso",
    descricao: "Regras e condições do sistema",
    icone: "documento",
    emBreve: "Termos de uso",
  },
  {
    id: "privacidade",
    titulo: "Política de Privacidade",
    descricao: "Seus dados estão protegidos",
    icone: "escudoCheck",
    emBreve: "Política de privacidade",
  },
];
