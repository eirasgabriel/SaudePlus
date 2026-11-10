/**
 * Definição única da navegação administrativa.
 * Alterar aqui reflete no menu do topo, no menu lateral e nas rotas.
 */

export const itensMenu = [
  { id: "dashboard", rotulo: "Dashboard", icone: "home", para: "/admin" },
  { id: "usuarios", rotulo: "Usuários", icone: "usuarios", para: "/admin/usuarios" },
  { id: "clinicas", rotulo: "Clínicas", icone: "clinica", para: "/admin/clinicas" },
  { id: "agendamentos", rotulo: "Agendamentos", icone: "calendario", para: "/admin/agendamentos" },
  // Não é módulo próprio: a fila de exames vem com o módulo de agendamentos (ModuloAdmin no back-end).
  { id: "exames", modulo: "agendamentos", rotulo: "Exames", icone: "frasco", para: "/admin/exames" },
  { id: "relatorios", rotulo: "Relatórios", icone: "grafico", para: "/admin/relatorios" },
  { id: "financeiro", rotulo: "Financeiro", icone: "banco", para: "/admin/financeiro" },
  { id: "configuracoes", rotulo: "Configurações", icone: "engrenagem", para: "/admin/configuracoes" },
  { id: "suporte", rotulo: "Suporte", icone: "suporte", para: "/admin/suporte" },
];

/** O menu do topo repete os principais, começando por "Início". */
export const itensTopo = [
  { id: "dashboard", rotulo: "Início", icone: "home", para: "/admin" },
  { id: "usuarios", rotulo: "Usuários", icone: "usuarios", para: "/admin/usuarios" },
  { id: "clinicas", rotulo: "Clínicas", icone: "clinica", para: "/admin/clinicas" },
  { id: "agendamentos", rotulo: "Agendamentos", icone: "calendario", para: "/admin/agendamentos" },
  { id: "relatorios", rotulo: "Relatórios", icone: "grafico", para: "/admin/relatorios" },
  { id: "configuracoes", rotulo: "Configurações", icone: "engrenagem", para: "/admin/configuracoes" },
];

/** Administrador logado (trocar pelo contexto de autenticação). */
export const usuarioLogado = {
  nome: "Admin Master",
  cargo: "Administrador",
  foto: null,
  naoLidas: 3,
};
