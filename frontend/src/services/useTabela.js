import { useMemo, useState } from "react";

/**
 * Busca + filtros + paginação para as tabelas administrativas.
 *
 * const tabela = useTabela({
 *   dados: usuarios,
 *   porPagina: 7,
 *   camposBusca: ['nome', 'cpf', 'email'],
 *   filtros: { status: (item, valor) => item.status === valor },
 * });
 *
 * Retorna a fatia da página atual e tudo o que a UI precisa para navegar.
 * Trocar a busca ou um filtro volta para a página 1 automaticamente.
 */
export default function useTabela({
  dados,
  porPagina = 7,
  camposBusca = [],
  filtros = {},
  valoresIniciais = {},
}) {
  const [busca, definirBusca] = useState("");
  const [valores, definirValores] = useState(valoresIniciais);
  const [pagina, definirPagina] = useState(1);

  /** Ignora acentos e caixa para a busca não depender de digitação exata. */
  function normalizar(texto) {
    return String(texto ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  const filtrados = useMemo(() => {
    const alvo = normalizar(busca.trim());

    return dados.filter((item) => {
      // 1) busca textual
      if (alvo) {
        const achou = camposBusca.some((campo) =>
          normalizar(item[campo]).includes(alvo)
        );
        if (!achou) return false;
      }

      // 2) filtros — o valor "todos"/"todas" desliga o filtro
      return Object.entries(filtros).every(([chave, testar]) => {
        const valor = valores[chave];
        if (!valor || valor === "todos" || valor === "todas") return true;
        return testar(item, valor);
      });
    });
  }, [dados, busca, valores, camposBusca, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const inicio = (paginaSegura - 1) * porPagina;
  const visiveis = filtrados.slice(inicio, inicio + porPagina);

  function aoBuscar(texto) {
    definirBusca(texto);
    definirPagina(1);
  }

  function definirFiltro(chave, valor) {
    definirValores((atuais) => ({ ...atuais, [chave]: valor }));
    definirPagina(1);
  }

  function limpar() {
    definirBusca("");
    definirValores(valoresIniciais);
    definirPagina(1);
  }

  return {
    busca,
    aoBuscar,
    valores,
    definirFiltro,
    limpar,
    visiveis,
    total: filtrados.length,
    totalGeral: dados.length,
    pagina: paginaSegura,
    totalPaginas,
    definirPagina,
    mostrando: {
      inicio: filtrados.length === 0 ? 0 : inicio + 1,
      fim: Math.min(inicio + porPagina, filtrados.length),
    },
  };
}
