import { useEffect, useState } from "react";
import { http } from "./http.js";

/*
 * Identidade do site gravada em Configurações > Geral (GET /api/publico/identidade):
 * nome, descrição, contatos e cores. Campo nulo usa o padrão do próprio site.
 * Busca uma vez por carregamento da página; falha deixa o padrão.
 */

let pedido = null;
let atual = null;
const ouvintes = new Set();

/** Valores padrão do site, os mesmos de antes da configuração existir. */
export const IDENTIDADE_PADRAO = {
  nomeSistema: "SaúdePlus",
  descricao: "Agendamento de consultas e exames, com profissionais e unidades perto de você.",
  emailSuporte: null,
  telefone: null,
  endereco: null,
  corPrincipal: null,
  corSecundaria: null,
};

const COR = /^#[0-9a-fA-F]{6}$/;

/**
 * Cores do Geral no tema claro; o tema escuro mantém a paleta própria. Vai
 * numa folha de estilo (e não no `style` do <html>) para trocar de tema
 * continuar funcionando. Só cor em hexadecimal entra no CSS.
 */
function aplicarCores(identidade) {
  const regras = [
    COR.test(identidade.corPrincipal ?? "") && `--color-primary: ${identidade.corPrincipal};`,
    COR.test(identidade.corSecundaria ?? "") && `--color-accent: ${identidade.corSecundaria};`,
  ].filter(Boolean);
  let folha = document.getElementById("identidade-do-site");
  if (!regras.length) {
    folha?.remove();
    return;
  }
  if (!folha) {
    folha = document.createElement("style");
    folha.id = "identidade-do-site";
    document.head.appendChild(folha);
  }
  folha.textContent = `:root:not([data-tema="escuro"]) { ${regras.join(" ")} }`;
}

function publicar(identidade) {
  atual = identidade;
  ouvintes.forEach((ouvir) => ouvir(identidade));
}

/** Carrega a identidade (uma vez) e aplica as cores. */
export function carregarIdentidade() {
  if (!pedido) {
    pedido = http
      .get("/api/publico/identidade")
      .then((recebida) => {
        const identidade = { ...IDENTIDADE_PADRAO };
        for (const [campo, valor] of Object.entries(recebida ?? {})) {
          if (valor != null && valor !== "") identidade[campo] = valor;
        }
        publicar(identidade);
        aplicarCores(identidade);
        return identidade;
      })
      .catch(() => {
        publicar(IDENTIDADE_PADRAO);
        return IDENTIDADE_PADRAO;
      });
  }
  return pedido;
}

/** Nome do sistema já conhecido, sem disparar busca (para o título da aba). */
export function nomeDoSistema() {
  return atual?.nomeSistema ?? IDENTIDADE_PADRAO.nomeSistema;
}

/**
 * Identidade para o site público. `carregar: false` só escuta (não busca):
 * as áreas logadas não pedem nada a mais ao servidor.
 */
export function useIdentidadeDoSite({ carregar = true } = {}) {
  const [identidade, definirIdentidade] = useState(atual ?? IDENTIDADE_PADRAO);
  useEffect(() => {
    ouvintes.add(definirIdentidade);
    if (carregar) carregarIdentidade();
    return () => ouvintes.delete(definirIdentidade);
  }, [carregar]);
  return identidade;
}
