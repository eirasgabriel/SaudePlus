import { useSearchParams } from "react-router-dom";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Abas from "../components/Abas";
import { abas } from "../services/dadosAdminConfiguracoes";

import AbaGeral from "../components/AdminConfigGeral";
import AbaUsuarios from "../components/AdminConfigUsuarios";
import AbaClinicas from "../components/AdminConfigClinicas";
import AbaNotificacoes from "../components/AdminConfigNotificacoes";
import AbaIntegracoes from "../components/AdminConfigIntegracoes";
import AbaSeguranca from "../components/AdminConfigSeguranca";

const conteudos = {
  geral: AbaGeral,
  usuarios: AbaUsuarios,
  clinicas: AbaClinicas,
  notificacoes: AbaNotificacoes,
  integracoes: AbaIntegracoes,
  seguranca: AbaSeguranca,
};

/** Subtítulo específico de cada aba, como no protótipo. */
const subtitulos = {
  geral: "Gerencie as configurações do sistema SaúdePlus.",
  usuarios: "Gerenciamento de usuários, permissões e acessos do sistema SaúdePlus.",
  clinicas: "Gerencie as clínicas e unidades do sistema SaúdePlus.",
  notificacoes: "Gerencie as notificações do sistema SaúdePlus.",
  integracoes: "Gerencie as integrações e conexões externas do sistema SaúdePlus.",
  seguranca: "Proteja os dados e garanta o acesso seguro ao sistema.",
};

/**
 * Casca das Configurações.
 * A aba ativa fica na URL (?aba=seguranca), então o link é compartilhável
 * e o botão "voltar" do navegador funciona entre as abas.
 */
/** `propsDasAbas`: props extras por aba (ex.: `{ usuarios: { aoSalvarPermissoes } }`). */
export default function AdminConfiguracoesPage({ propsDasAbas = {}, aviso = null }) {
  const [parametros, definirParametros] = useSearchParams();
  const aba = conteudos[parametros.get("aba")] ? parametros.get("aba") : "geral";
  const Conteudo = conteudos[aba];

  function trocarAba(id) {
    definirParametros(id === "geral" ? {} : { aba: id });
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo={subtitulos[aba]}
        icone="engrenagem"
        data={new Date(2026, 8, 15)}
      />

      {aviso}

      <Abas abas={abas} ativa={aba} aoTrocar={trocarAba} />

      <Conteudo {...(propsDasAbas[aba] ?? {})} />
    </>
  );
}
