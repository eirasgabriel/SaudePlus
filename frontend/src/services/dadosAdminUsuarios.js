import { fotoDoPaciente } from "./fotosPacientes";

/* Dados fictícios da tela de Usuários.
   Na integração, troque por GET /api/usuarios mantendo o mesmo formato. */

export const metricas = [
  {
    id: "total",
    rotulo: "Total de usuários",
    valor: "4.862",
    icone: "usuarios",
    nota: "usuários cadastrados no sistema",
    variacao: { valor: "12%", tendencia: "sobe" },
  },
  {
    id: "ativos",
    rotulo: "Usuários ativos",
    valor: "4.521",
    icone: "usuario",
    nota: "com acesso ao sistema",
    variacao: { valor: "15%", tendencia: "sobe" },
  },
  {
    id: "novos",
    rotulo: "Novos este mês",
    valor: "184",
    icone: "calendarioMais",
    nota: "usuários cadastrados",
    variacao: { valor: "22%", tendencia: "sobe" },
  },
  {
    id: "bloqueados",
    rotulo: "Usuários bloqueados",
    valor: "157",
    icone: "cadeado",
    nota: "acesso suspenso",
    tom: "vermelho",
    variacao: { valor: "3%", tendencia: "sobe" },
  },
];

/** perfis aceitos: paciente | medico | enfermeiro | administrador | agente | recepcionista */
export const perfisUsuario = {
  paciente: { rotulo: "Paciente", variante: "info", icone: "usuario" },
  medico: { rotulo: "Médico", variante: "roxo", icone: "estetoscopio" },
  enfermeiro: { rotulo: "Enfermeiro(a)", variante: "sucesso", icone: "escudoCheck" },
  administrador: { rotulo: "Administrador", variante: "ciano", icone: "usuarios" },
  agente: { rotulo: "Agente Comunitário", variante: "aviso", icone: "usuarios" },
  recepcionista: { rotulo: "Recepcionista", variante: "rosa", icone: "usuario" },
  gestor: { rotulo: "Gestor", variante: "roxo", icone: "usuarios" },
};

export const statusUsuario = {
  ativo: { rotulo: "Ativo", variante: "sucesso" },
  bloqueado: { rotulo: "Bloqueado", variante: "erro" },
  inativo: { rotulo: "Inativo", variante: "neutro" },
};

export const usuarios = [
  {
    id: 1,
    nome: "Maria Silva Santos",
    cargo: "Paciente",
    cpf: "123.456.789-00",
    email: "maria.silva@email.com",
    telefone: "(22) 99876-5432",
    perfil: "paciente",
    status: "ativo",
    ultimoAcesso: "15/09/2026 09:42",
    foto: fotoDoPaciente("Maria Silva Santos"),
  },
  {
    id: 2,
    nome: "João Pereira Lima",
    cargo: "Médico",
    cpf: "987.654.321-00",
    email: "joao.lima@saudeplus.com",
    telefone: "(22) 98765-4321",
    perfil: "medico",
    status: "ativo",
    ultimoAcesso: "15/09/2026 08:15",
    foto: fotoDoPaciente("João Pereira Lima"),
  },
  {
    id: 3,
    nome: "Ana Costa Oliveira",
    cargo: "Enfermeiro(a)",
    cpf: "456.789.123-00",
    email: "ana.costa@saudeplus.com",
    telefone: "(22) 97654-3210",
    perfil: "enfermeiro",
    status: "ativo",
    ultimoAcesso: "14/09/2026 16:38",
    foto: fotoDoPaciente("Ana Costa Oliveira"),
  },
  {
    id: 4,
    nome: "Carlos Eduardo Mendes",
    cargo: "Administrador",
    cpf: "321.654.987-00",
    email: "carlos.mendes@saudeplus.com",
    telefone: "(22) 96543-2109",
    perfil: "administrador",
    status: "ativo",
    ultimoAcesso: "14/09/2026 14:27",
    foto: fotoDoPaciente("Carlos Eduardo Mendes"),
  },
  {
    id: 5,
    nome: "Juliana Ferreira Alves",
    cargo: "Agente Comunitário",
    cpf: "654.321.987-00",
    email: "juliana.alves@saudeplus.com",
    telefone: "(22) 95432-1098",
    perfil: "agente",
    status: "bloqueado",
    ultimoAcesso: "12/09/2026 10:12",
    foto: fotoDoPaciente("Juliana Ferreira Alves"),
  },
  {
    id: 6,
    nome: "Roberto Almeida Souza",
    cargo: "Recepcionista",
    cpf: "789.456.123-00",
    email: "roberto.souza@saudeplus.com",
    telefone: "(22) 94321-0987",
    perfil: "recepcionista",
    status: "ativo",
    ultimoAcesso: "11/09/2026 17:05",
    foto: fotoDoPaciente("Roberto Almeida Souza"),
  },
  {
    id: 7,
    nome: "Fernanda Rocha Costa",
    cargo: "Paciente",
    cpf: "258.369.147-00",
    email: "fernanda.rocha@email.com",
    telefone: "(22) 91234-5678",
    perfil: "paciente",
    status: "ativo",
    ultimoAcesso: "11/09/2026 11:32",
    foto: fotoDoPaciente("Fernanda Rocha Costa"),
  },
  {
    id: 8,
    nome: "Lucas Almeida Pinto",
    cargo: "Paciente",
    cpf: "147.258.369-00",
    email: "lucas.almeida@email.com",
    telefone: "(22) 99111-2233",
    perfil: "paciente",
    status: "ativo",
    ultimoAcesso: "10/09/2026 08:04",
    foto: fotoDoPaciente("Lucas Almeida Pinto"),
  },
  {
    id: 9,
    nome: "Patrícia Alves Moreira",
    cargo: "Médica",
    cpf: "369.147.258-00",
    email: "patricia.alves@saudeplus.com",
    telefone: "(22) 99222-3344",
    perfil: "medico",
    status: "ativo",
    ultimoAcesso: "09/09/2026 19:50",
    foto: fotoDoPaciente("Patrícia Alves Moreira"),
  },
  {
    id: 10,
    nome: "Thiago Martins Dias",
    cargo: "Recepcionista",
    cpf: "852.963.741-00",
    email: "thiago.martins@saudeplus.com",
    telefone: "(22) 99333-4455",
    perfil: "recepcionista",
    status: "inativo",
    ultimoAcesso: "02/09/2026 13:20",
    foto: fotoDoPaciente("Thiago Martins Dias"),
  },
];

export const filtrosStatus = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativo", rotulo: "Ativos" },
  { valor: "bloqueado", rotulo: "Bloqueados" },
  { valor: "inativo", rotulo: "Inativos" },
];

export const filtrosPerfil = [
  { valor: "todos", rotulo: "Todos" },
  ...Object.entries(perfisUsuario).map(([valor, p]) => ({ valor, rotulo: p.rotulo })),
];

export const filtrosUnidade = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "centro", rotulo: "Unidade Centro" },
  { valor: "jacone", rotulo: "Unidade Jaconé" },
  { valor: "itauna", rotulo: "Unidade Itaúna" },
];
