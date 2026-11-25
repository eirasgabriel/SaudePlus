import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Abas from "../components/Abas";
import { abas } from "../services/dadosAdminConfiguracoes";

import AbaGeral from "../components/AdminConfigGeral";
import AbaUsuarios from "../components/AdminConfigUsuarios";
import AbaAgendamento from "../components/AdminConfigAgendamento";
import AbaCadastros from "../components/AdminConfigCadastros";
import AbaNotificacoes from "../components/AdminConfigNotificacoes";
import AbaIntegracoes from "../components/AdminConfigIntegracoes";
import AbaSeguranca from "../components/AdminConfigSeguranca";

const conteudos = {
  geral: AbaGeral,
  usuarios: AbaUsuarios,
  agendamento: AbaAgendamento,
  cadastros: AbaCadastros,
  notificacoes: AbaNotificacoes,
  integracoes: AbaIntegracoes,
  seguranca: AbaSeguranca,
};

/** Subtítulo específico de cada aba, como no protótipo. */
const subtitulos = {
  geral: "Gerencie as configurações do sistema SaúdePlus.",
  usuarios: "Defina o que cada papel da equipe pode acessar no SaúdePlus.",
  agendamento: "Defina os prazos de reserva e cancelamento das consultas.",
  cadastros: "Gerencie as especialidades e os tipos de exame da rede.",
  notificacoes: "Gerencie as notificações do sistema SaúdePlus.",
  integracoes: "Gerencie as integrações e conexões externas do sistema SaúdePlus.",
  seguranca: "Proteja os dados e garanta o acesso seguro ao sistema.",
};

/** Abas que saíram das Configurações e ganharam tela própria: o link antigo leva até ela. */
const abasQueMudaram = {
  clinicas: "/admin/clinicas",
};

/**
 * Casca das Configurações.
 * A aba ativa fica na URL (?aba=seguranca), então o link é compartilhável
 * e o botão "voltar" do navegador funciona entre as abas.
 */
/** `propsDasAbas`: props extras por aba (ex.: `{ usuarios: { aoSalvarPermissoes } }`). */
export default function AdminConfiguracoesPage({ propsDasAbas = {}, aviso = null }) {
  const [parametros, definirParametros] = useSearchParams();
  const [hoje] = useState(() => new Date());
  const aba = conteudos[parametros.get("aba")] ? parametros.get("aba") : "geral";
  const Conteudo = conteudos[aba];

  function trocarAba(id) {
    definirParametros(id === "geral" ? {} : { aba: id });
  }

  const novoEndereco = abasQueMudaram[parametros.get("aba")];
  if (novoEndereco) return <Navigate to={novoEndereco} replace />;

  return (
    <>
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo={subtitulos[aba]}
        icone="engrenagem"
        data={hoje}
      />

      {aviso}

      <Abas abas={abas} ativa={aba} aoTrocar={trocarAba} />

      <Conteudo {...(propsDasAbas[aba] ?? {})} />
    </>
  );
}
