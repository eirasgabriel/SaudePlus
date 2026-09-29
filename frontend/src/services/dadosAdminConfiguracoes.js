/* Dados fictícios das 6 abas de Configurações. */

export const abas = [
  { id: "geral", rotulo: "Geral", icone: "engrenagem" },
  { id: "usuarios", rotulo: "Usuários e Permissões", icone: "usuario" },
  { id: "clinicas", rotulo: "Clínicas e Unidades", icone: "predio" },
  { id: "notificacoes", rotulo: "Notificações", icone: "sino" },
  { id: "integracoes", rotulo: "Integrações", icone: "link" },
  { id: "seguranca", rotulo: "Segurança", icone: "escudoCheck" },
];

/* =========================================================
   Aba: Geral
   ========================================================= */
export const configuracoesGerais = {
  nomeSistema: "SaúdePlus",
  descricao:
    "Plataforma de acesso à saúde pública de Saquarema.\nMais praticidade, informação e cuidado para você.",
  emailSuporte: "suporte@saudeplus.com",
  telefone: "(22) 99876-5432",
  endereco: "Rua das Flores, 123 - Saquarema, RJ",
  idioma: "pt-BR",
  fusoHorario: "America/Sao_Paulo",
  corPrincipal: "#0066FF",
  corSecundaria: "#7DD3FC",
  tema: "claro",
};

export const opcoesIdioma = [
  { valor: "pt-BR", rotulo: "Português (Brasil)" },
  { valor: "en-US", rotulo: "English (US)" },
  { valor: "es-ES", rotulo: "Español" },
];

export const opcoesFuso = [
  { valor: "America/Sao_Paulo", rotulo: "America/Sao_Paulo (GMT -03:00)" },
  { valor: "America/Manaus", rotulo: "America/Manaus (GMT -04:00)" },
  { valor: "America/Noronha", rotulo: "America/Noronha (GMT -02:00)" },
];

export const notificacoesSistema = [
  {
    id: "novos",
    titulo: "Novos agendamentos",
    descricao: "Notificar sobre novos agendamentos realizados",
    ativo: true,
  },
  {
    id: "cancelamentos",
    titulo: "Cancelamentos",
    descricao: "Notificar sobre cancelamentos de consultas",
    ativo: true,
  },
  {
    id: "lembretes",
    titulo: "Lembretes de consulta",
    descricao: "Enviar lembretes 24h antes da consulta",
    ativo: true,
  },
  {
    id: "atualizacoes",
    titulo: "Atualizações do sistema",
    descricao: "Receber avisos sobre novas versões",
    ativo: false,
  },
  {
    id: "semanais",
    titulo: "Relatórios semanais",
    descricao: "Receber resumo das atividades por e-mail",
    ativo: true,
  },
];

export const backupSistema = {
  ultimo: "15/09/2026 às 02:00",
  status: "Concluído",
};

export const informacoesSistema = [
  { rotulo: "Versão do sistema", valor: "v2.8.0" },
  { rotulo: "Banco de dados", valor: "PostgreSQL 15" },
  { rotulo: "Servidor", valor: "saudeplus-app" },
  { rotulo: "Última atualização", valor: "15/09/2026 01:45" },
];

/* =========================================================
   Aba: Usuários e Permissões
   ========================================================= */
export const papeis = [
  {
    id: "administrador",
    rotulo: "Administrador",
    descricao: "Acesso total ao sistema, incluindo configurações.",
    quantidade: 1,
    variante: "info",
    icone: "usuario",
  },
  {
    id: "gestor",
    rotulo: "Gestor",
    descricao: "Gerencia clínicas, usuários e relatórios.",
    quantidade: 1,
    variante: "roxo",
    icone: "usuario",
  },
  {
    id: "medico",
    rotulo: "Médico",
    descricao: "Acesso a agendamentos e prontuários.",
    quantidade: 1,
    variante: "erro",
    icone: "estetoscopio",
  },
  {
    id: "enfermeiro",
    rotulo: "Enfermeiro",
    descricao: "Acesso a pacientes, exames e agendamentos.",
    quantidade: 1,
    variante: "sucesso",
    icone: "escudoCheck",
  },
  {
    id: "recepcionista",
    rotulo: "Recepcionista",
    descricao: "Acesso a agendamentos e informações básicas.",
    quantidade: 3,
    variante: "ciano",
    icone: "usuario",
  },
  {
    id: "agente",
    rotulo: "Agente comunitário",
    descricao: "Acompanhamento das famílias do território.",
    quantidade: 0,
    variante: "rosa",
    icone: "usuario",
  },
];

export const usuariosSistema = [
  {
    id: 1,
    nome: "Admin Master",
    cargo: "Administrador",
    email: "admin@saudeplus.com",
    papel: "administrador",
    unidade: "Todas",
    status: "ativo",
  },
  {
    id: 2,
    nome: "Danielle Gil Silva",
    cargo: "Gestora de Sistema",
    email: "danielle@saudeplus.com",
    papel: "gestor",
    unidade: "Saúde+ (Matriz)",
    status: "ativo",
  },
  {
    id: 3,
    nome: "Ana Julia da Silva",
    cargo: "Recepcionista",
    email: "ana.julia@saudeplus.com",
    papel: "recepcionista",
    unidade: "Unidade Centro",
    status: "ativo",
  },
  {
    id: 4,
    nome: "Fabricio Lima Galisa",
    cargo: "Médico",
    email: "fabricio@saudeplus.com",
    papel: "medico",
    unidade: "Unidade Centro",
    status: "ativo",
  },
  {
    id: 5,
    nome: "Gabriel Pereira M. Moreira",
    cargo: "Enfermeiro",
    email: "gabriel@saudeplus.com",
    papel: "enfermeiro",
    unidade: "Unidade Itaúna",
    status: "ativo",
  },
  {
    id: 6,
    nome: "Jean Lucas Fernandes Martins",
    cargo: "Recepcionista",
    email: "jean.lucas@saudeplus.com",
    papel: "recepcionista",
    unidade: "Unidade Itaúna",
    status: "ativo",
  },
  {
    id: 7,
    nome: "Dayana Batista",
    cargo: "Recepcionista",
    email: "dayana@saudeplus.com",
    papel: "recepcionista",
    unidade: "Unidade Centro",
    status: "ativo",
  },
];

/** Matriz de permissões: true = módulo liberado para o papel. */
export const modulosPermissao = [
  { id: "dashboard", rotulo: "Dashboard", icone: "home" },
  { id: "usuarios", rotulo: "Usuários", icone: "usuarios" },
  { id: "clinicas", rotulo: "Clínicas", icone: "clinica" },
  { id: "agendamentos", rotulo: "Agendamentos", icone: "calendario" },
  { id: "relatorios", rotulo: "Relatórios", icone: "grafico" },
  { id: "financeiro", rotulo: "Financeiro", icone: "banco" },
  { id: "configuracoes", rotulo: "Configurações", icone: "engrenagem" },
];

export const colunasPermissao = [
  { id: "administrador", rotulo: "Adm" },
  { id: "gestor", rotulo: "Gestor" },
  { id: "medico", rotulo: "Médico" },
  { id: "enfermeiro", rotulo: "Enf." },
  { id: "recepcionista", rotulo: "Recep." },
];

export const permissoesIniciais = {
  dashboard: { administrador: true, gestor: true, medico: true, enfermeiro: true, recepcionista: true },
  usuarios: { administrador: true, gestor: true, medico: true, enfermeiro: true, recepcionista: true },
  clinicas: { administrador: true, gestor: true, medico: true, enfermeiro: false, recepcionista: false },
  agendamentos: { administrador: true, gestor: true, medico: true, enfermeiro: false, recepcionista: true },
  relatorios: { administrador: true, gestor: true, medico: false, enfermeiro: true, recepcionista: true },
  financeiro: { administrador: true, gestor: false, medico: false, enfermeiro: true, recepcionista: false },
  configuracoes: { administrador: true, gestor: false, medico: false, enfermeiro: false, recepcionista: false },
};

/* =========================================================
   Aba: Clínicas e Unidades
   ========================================================= */
export const unidadesCadastradas = [
  {
    id: 1,
    nome: "UBS Central",
    cnpj: "12.345.678/0001-90",
    unidade: "Unidade Centro",
    endereco: "Rua das Flores, 123",
    bairro: "Centro - Saquarema/RJ",
    telefone: "(22) 99876-5432",
    email: "ubscentral@saudeplus.com",
    funcionamento: [
      "Segunda a Sexta: 07:00 - 17:00",
      "Sábado: 07:00 - 12:00",
    ],
    status: "ativa",
    vinculadas: [
      { id: "centro", rotulo: "Unidade Centro", status: "ativa" },
      { id: "jacone", rotulo: "Unidade Jaconé", status: "ativa" },
      { id: "itauna", rotulo: "Unidade Itaúna", status: "ativa" },
    ],
  },
  {
    id: 2,
    nome: "UBS Jaconé",
    cnpj: "98.765.432/0001-11",
    unidade: "Unidade Jaconé",
    endereco: "Av. Beira Mar, 456",
    bairro: "Jaconé - Saquarema/RJ",
    telefone: "(22) 99911-2233",
    email: "ubsjacone@saudeplus.com",
    funcionamento: ["Segunda a Sexta: 07:00 - 17:00"],
    status: "ativa",
    vinculadas: [{ id: "jacone", rotulo: "Unidade Jaconé", status: "ativa" }],
  },
  {
    id: 3,
    nome: "ESF Itaúna",
    cnpj: "11.222.333/0001-44",
    unidade: "Unidade Itaúna",
    endereco: "Rua do Sol, 789",
    bairro: "Itaúna - Saquarema/RJ",
    telefone: "(22) 99777-6655",
    email: "esfitauna@saudeplus.com",
    funcionamento: ["Segunda a Sexta: 08:00 - 17:00"],
    status: "ativa",
    vinculadas: [{ id: "itauna", rotulo: "Unidade Itaúna", status: "ativa" }],
  },
  {
    id: 4,
    nome: "Policlínica Saquarema",
    cnpj: "55.666.777/0001-88",
    unidade: "Unidade Centro",
    endereco: "Av. Saquarema, 1000",
    bairro: "Centro - Saquarema/RJ",
    telefone: "(22) 99888-7766",
    email: "policlinica@saudeplus.com",
    funcionamento: ["Segunda a Sexta: 07:00 - 19:00"],
    status: "ativa",
    vinculadas: [{ id: "centro", rotulo: "Unidade Centro", status: "ativa" }],
  },
  {
    id: 5,
    nome: "CAPS",
    cnpj: "77.888.999/0001-22",
    unidade: "Unidade Centro",
    endereco: "Rua da Esperança, 321",
    bairro: "Centro - Saquarema/RJ",
    telefone: "(22) 99666-5544",
    email: "caps@saudeplus.com",
    funcionamento: ["Segunda a Sexta: 08:00 - 18:00"],
    status: "ativa",
    vinculadas: [{ id: "centro", rotulo: "Unidade Centro", status: "ativa" }],
  },
  {
    id: 6,
    nome: "UBS Boqueirão",
    cnpj: "44.555.666/0001-77",
    unidade: "Unidade Boqueirão",
    endereco: "Rua das Acácias, 210",
    bairro: "Boqueirão - Saquarema/RJ",
    telefone: "(22) 99444-3322",
    email: "ubsboqueirao@saudeplus.com",
    funcionamento: ["Segunda a Sexta: 08:00 - 16:00"],
    status: "manutencao",
    vinculadas: [{ id: "boqueirao", rotulo: "Unidade Boqueirão", status: "manutencao" }],
  },
  {
    id: 7,
    nome: "ESF Palmital",
    cnpj: "33.222.111/0001-00",
    unidade: "Unidade Palmital",
    endereco: "Rua Principal, 50",
    bairro: "Palmital - Saquarema/RJ",
    telefone: "(22) 99222-1100",
    email: "esfpalmital@saudeplus.com",
    funcionamento: ["Temporariamente suspenso"],
    status: "inativa",
    vinculadas: [{ id: "palmital", rotulo: "Unidade Palmital", status: "inativa" }],
  },
];

export const filtrosUnidadeConfig = [
  { valor: "todas", rotulo: "Todas as unidades" },
  { valor: "Unidade Centro", rotulo: "Unidade Centro" },
  { valor: "Unidade Jaconé", rotulo: "Unidade Jaconé" },
  { valor: "Unidade Itaúna", rotulo: "Unidade Itaúna" },
  { valor: "Unidade Boqueirão", rotulo: "Unidade Boqueirão" },
  { valor: "Unidade Palmital", rotulo: "Unidade Palmital" },
];

export const filtrosClinicaConfig = [
  { valor: "todas", rotulo: "Todas as clínicas" },
  { valor: "ativa", rotulo: "Somente ativas" },
  { valor: "manutencao", rotulo: "Em manutenção" },
  { valor: "inativa", rotulo: "Inativas" },
];

/* =========================================================
   Aba: Notificações
   ========================================================= */
export const canaisNotificacao = [
  {
    id: "email",
    titulo: "E-mail",
    descricao: "Envio de notificações por e-mail para usuários, médicos e clínicas.",
    icone: "email",
    ativo: true,
  },
  {
    id: "sms",
    titulo: "SMS",
    descricao: "Envio de mensagens de texto para o celular.",
    icone: "chat",
    ativo: true,
  },
  {
    id: "push",
    titulo: "Push (App)",
    descricao: "Notificações no aplicativo móvel.",
    icone: "sino",
    ativo: true,
  },
  {
    id: "sistema",
    titulo: "Notificações no sistema",
    descricao: "Alertas visíveis no painel do sistema.",
    icone: "monitor",
    ativo: true,
  },
];

export const tiposNotificacao = [
  {
    id: "agendamentos",
    titulo: "Agendamentos",
    descricao: "Confirmações, lembretes e cancelamentos de consultas.",
    icone: "calendario",
    ativo: true,
  },
  {
    id: "exames",
    titulo: "Resultados de exames",
    descricao: "Disponibilidade de laudos e resultados de exames.",
    icone: "documento",
    ativo: true,
  },
  {
    id: "mensagens",
    titulo: "Mensagens do sistema",
    descricao: "Avisos importantes e comunicados.",
    icone: "sino",
    ativo: true,
  },
  {
    id: "cadastro",
    titulo: "Atualizações de cadastro",
    descricao: "Alterações de dados do usuário.",
    icone: "usuario",
    ativo: true,
  },
  {
    id: "lembretes",
    titulo: "Lembretes de consulta",
    descricao: "Envio de lembretes por e-mail e SMS.",
    icone: "relogio",
    ativo: true,
  },
];

export const horariosEnvio = [
  { id: "manha", rotulo: "Manhã", inicio: "08:00", fim: "12:00" },
  { id: "tarde", rotulo: "Tarde", inicio: "13:00", fim: "18:00" },
  { id: "noite", rotulo: "Noite", inicio: "18:00", fim: "22:00" },
];

export const opcoesHora = Array.from({ length: 24 }, (_, h) => {
  const valor = `${String(h).padStart(2, "0")}:00`;
  return { valor, rotulo: valor };
});

export const modelosMensagem = [
  { id: "confirmacao", titulo: "E-mail de confirmação de agendamento", icone: "email" },
  { id: "lembrete", titulo: "Lembrete de consulta", icone: "relogio" },
  { id: "resultado", titulo: "Resultado de exame", icone: "documento" },
  { id: "comunicado", titulo: "Comunicados do sistema", icone: "megafone" },
];

/* =========================================================
   Aba: Integrações
   ========================================================= */
export const integracoes = [
  {
    id: "google",
    titulo: "Google Calendar",
    descricao: "Sincronização de agendas e compromissos.",
    icone: "calendario",
    tom: "azul",
    tipo: "interruptor",
    ativo: true,
  },
  {
    id: "whatsapp",
    titulo: "WhatsApp",
    descricao: "Envio de confirmações e lembretes.",
    icone: "chat",
    tom: "verde",
    tipo: "interruptor",
    ativo: true,
  },
  {
    id: "smtp",
    titulo: "E-mail / SMTP",
    descricao: "Envio de e-mails do sistema.",
    icone: "email",
    tom: "neutro",
    tipo: "configurar",
    etiqueta: { rotulo: "Conectado", variante: "info" },
  },
  {
    id: "notificacoes",
    titulo: "Notificações",
    descricao: "Alertas visíveis no painel do sistema.",
    icone: "sino",
    tom: "azul",
    tipo: "interruptor",
    ativo: true,
  },
  {
    id: "push",
    titulo: "Push (App)",
    descricao: "Notificações no aplicativo móvel.",
    icone: "celular",
    tom: "azul",
    tipo: "interruptor",
    ativo: true,
  },
  {
    id: "cadastro",
    titulo: "Atualizações de cadastro",
    descricao: "Alterações de dados do usuário.",
    icone: "usuario",
    tom: "azul",
    tipo: "configurar",
    etiqueta: { rotulo: "Ativo", variante: "sucesso" },
  },
  {
    id: "lembretes",
    titulo: "Lembretes de consulta",
    descricao: "Envio de lembretes por e-mail e SMS.",
    icone: "relogio",
    tom: "azul",
    tipo: "configurar",
    etiqueta: { rotulo: "Ativo", variante: "sucesso" },
  },
];

export const integracoesDisponiveis = [
  {
    id: "google",
    titulo: "Google Calendar",
    descricao: "Sincronize agendas, compromissos e horários de atendimento.",
    icone: "calendario",
  },
  {
    id: "whatsapp",
    titulo: "WhatsApp",
    descricao: "Envie confirmações, lembretes e notificações para seus pacientes.",
    icone: "chat",
    tom: "verde",
  },
  {
    id: "convenios",
    titulo: "Convênios",
    descricao: "Integre com operadoras e valide convênios de forma automática.",
    icone: "escudo",
  },
  {
    id: "api",
    titulo: "API / Sistemas Externos",
    descricao:
      "Conecte com outros sistemas através de API e amplie as funcionalidades do seu serviço.",
    icone: "codigo",
    tom: "roxo",
  },
];

/* =========================================================
   Aba: Segurança
   ========================================================= */
export const itensSeguranca = [
  {
    id: "2fa",
    titulo: "Autenticação em Dois Fatores (2FA)",
    descricao: "Exija um segundo fator de autenticação para acesso à conta.",
    icone: "escudoCadeado",
    tipo: "interruptor",
    ativo: true,
    etiqueta: { rotulo: "Ativo", variante: "sucesso" },
  },
  {
    id: "senhas",
    titulo: "Política de Senhas",
    descricao: "Defina regras para criação de senhas mais seguras.",
    icone: "cadeado",
    tipo: "botao",
    botao: { rotulo: "Configurar", icone: "engrenagem" },
  },
  {
    id: "dispositivos",
    titulo: "Gerenciamento de Dispositivos",
    descricao: "Monitore os dispositivos que fazem login no sistema.",
    icone: "usuario",
    tipo: "botao",
    botao: { rotulo: "Ver Dispositivos", icone: "celular" },
  },
  {
    id: "logs",
    titulo: "Logs de Acesso",
    descricao: "Acompanhe os registros de login e atividades dos usuários.",
    icone: "documento",
    tipo: "botao",
    botao: { rotulo: "Visualizar Logs", icone: "relogio" },
  },
  {
    id: "lgpd",
    titulo: "LGPD e Privacidade",
    descricao: "Gerencie o consentimento e o tratamento de dados pessoais.",
    icone: "escudoCheck",
    tipo: "botao",
    botao: { rotulo: "Ver Políticas", icone: "documento" },
  },
  {
    id: "backup",
    titulo: "Backup e Recuperação",
    descricao: "Configure a periodicidade dos backups e planos de recuperação.",
    icone: "bancoDados",
    tipo: "botao",
    botao: { rotulo: "Configurar", icone: "bancoDados" },
  },
];

export const statusSeguranca = [
  { id: "2fa", rotulo: "2FA ativado", valor: "Sim", variante: "sucesso" },
  { id: "senhas", rotulo: "Política de senhas", valor: "Ativa", variante: "sucesso" },
  { id: "logs", rotulo: "Logs de acesso", valor: "Habilitado", variante: "sucesso" },
  { id: "backup", rotulo: "Backup automático", valor: "Ativo", variante: "sucesso" },
];

export const dicasSeguranca = [
  "Use senhas fortes e únicas.",
  "Ative a autenticação em dois fatores.",
  "Não compartilhe seus dados de acesso.",
  "Mantenha o sistema sempre atualizado.",
];
