/* Dados fictícios das abas de Configurações. */

/* Usuários e clínicas têm telas próprias no menu; aqui fica só o que é do
   sistema. A aba "usuarios" guarda o id antigo (links ?aba=usuarios), mas
   agora mostra apenas papéis e permissões. */
export const abas = [
  { id: "geral", rotulo: "Geral", icone: "engrenagem" },
  { id: "usuarios", rotulo: "Permissões", icone: "escudoCheck" },
  { id: "agendamento", rotulo: "Agendamento", icone: "calendario" },
  { id: "cadastros", rotulo: "Cadastros", icone: "documento" },
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
  corPrincipal: "#0070E8",
  corSecundaria: "#44C6F4",
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
   Aba: Notificações
   ========================================================= */
export const canaisNotificacao = [
  {
    id: "email",
    fixo: "Sempre ativo",
    titulo: "E-mail",
    descricao: "Hoje o e-mail só é usado na recuperação de senha, que não pode ser desligada.",
    icone: "email",
    ativo: true,
  },
  {
    id: "sms",
    disponivel: false,
    titulo: "SMS",
    descricao: "Envio de mensagens de texto para o celular.",
    icone: "chat",
    ativo: true,
  },
  {
    id: "push",
    disponivel: false,
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
    disponivel: false,
    titulo: "Atualizações de cadastro",
    descricao: "Alterações de dados do usuário.",
    icone: "usuario",
    ativo: true,
  },
  {
    id: "lembretes",
    disponivel: false,
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
/*
 * Situação real de cada integração. Nenhuma integração externa (Google,
 * WhatsApp, push) existe ainda: elas aparecem como "Em breve", sem
 * interruptor que finja ligar algo. O e-mail é configurado no servidor
 * (variáveis de ambiente do SMTP) e as notificações têm aba própria.
 */
export const integracoes = [
  {
    id: "google",
    titulo: "Google Calendar",
    descricao: "Sincronização de agendas e compromissos.",
    icone: "calendario",
    tom: "azul",
    situacao: { rotulo: "Em breve", variante: "neutro" },
  },
  {
    id: "whatsapp",
    titulo: "WhatsApp",
    descricao: "Envio de confirmações e lembretes.",
    icone: "chat",
    tom: "verde",
    situacao: { rotulo: "Em breve", variante: "neutro" },
  },
  {
    id: "smtp",
    titulo: "E-mail / SMTP",
    descricao: "Envio de e-mails do sistema. Servidor, usuário e senha ficam nas variáveis de ambiente do back-end.",
    icone: "email",
    tom: "neutro",
    situacao: { rotulo: "Configurado no servidor", variante: "info" },
  },
  {
    id: "notificacoes",
    titulo: "Notificações",
    descricao: "Alertas visíveis no painel do sistema.",
    icone: "sino",
    tom: "azul",
    situacao: { rotulo: "Nativo", variante: "sucesso" },
    aba: "notificacoes",
  },
  {
    id: "push",
    titulo: "Push (App)",
    descricao: "Notificações no aplicativo móvel.",
    icone: "celular",
    tom: "azul",
    situacao: { rotulo: "Em breve", variante: "neutro" },
  },
  {
    id: "lembretes",
    titulo: "Lembretes de consulta",
    descricao: "Envio de lembretes por e-mail e SMS.",
    icone: "relogio",
    tom: "azul",
    situacao: { rotulo: "Em breve", variante: "neutro" },
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
    // Ainda não existe no back-end: não aparece como ativo nem tem interruptor.
    tipo: "emBreve",
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

/* O que vale hoje no servidor, sem prometer o que ainda não existe. */
export const statusSeguranca = [
  { id: "2fa", rotulo: "2FA", valor: "Em breve", variante: "neutro" },
  { id: "senhas", rotulo: "Senha mínima", valor: "8 caracteres", variante: "sucesso" },
  { id: "logs", rotulo: "Logs de acesso", valor: "Habilitado", variante: "sucesso" },
  { id: "backup", rotulo: "Backup", valor: "Pelo provedor do banco", variante: "info" },
];

export const dicasSeguranca = [
  "Use senhas fortes e únicas.",
  "Revise os logs de acesso com frequência.",
  "Não compartilhe seus dados de acesso.",
  "Mantenha o sistema sempre atualizado.",
];
