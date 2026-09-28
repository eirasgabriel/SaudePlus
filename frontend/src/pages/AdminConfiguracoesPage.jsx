import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CabecalhoPagina from "../components/CabecalhoPagina";
import Abas from "../components/Abas";
import { abas as abasMock } from "../services/dadosAdminConfiguracoes";
import { listarConfiguracoes } from "../features/configuracoes/configuracoes.api";

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
export default function AdminConfiguracoesPage() {
  const [parametros, definirParametros] = useSearchParams();
  const [abas, setAbas] = useState(abasMock);
  const [subtitulosApi, setSubtitulosApi] = useState(subtitulos);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    listarConfiguracoes()
      .then((dados) => {
        if (!ativo) return;
        if (dados?.abas?.length) setAbas(dados.abas);
        if (dados?.subtitulos) setSubtitulosApi({ ...subtitulos, ...dados.subtitulos });
      })
      .catch(() => {
        if (ativo) {
          setAbas(abasMock);
          setSubtitulosApi(subtitulos);
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const aba = useMemo(() => {
    return conteudos[parametros.get("aba")] ? parametros.get("aba") : "geral";
  }, [parametros]);
  const Conteudo = conteudos[aba];

  function trocarAba(id) {
    definirParametros(id === "geral" ? {} : { aba: id });
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo={subtitulosApi[aba] ?? subtitulos[aba]}
        icone="engrenagem"
        data={new Date(2026, 8, 15)}
      />

      {carregando && (
        <div style={{ marginBottom: 16, color: "var(--texto-3)" }}>Carregando configurações...</div>
      )}

      <Abas abas={abas} ativa={aba} aoTrocar={trocarAba} />

      <Conteudo />
    </>
  );
}
