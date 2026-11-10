import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import { CampoBusca, Seletor, Botao } from "../components/Controles";
import {
  Tabela,
  CelulaDupla,
  AcoesLinha,
  RodapeTabela,
} from "../components/Tabela";
import useTabela from "../services/useTabela";
import {
  metricas as metricasMock,
  clinicas as clinicasMock,
  statusClinica,
  filtrosStatus,
  filtrosEspecialidade as filtrosEspecialidadeMock,
  filtrosMunicipio as filtrosMunicipioMock,
} from "../services/dadosAdminClinicas";
import comum from "../styles/adminComum.module.css";

const COLUNAS = [
  "#",
  "Nome da clínica",
  "Especialidade",
  "Endereço",
  "Município",
  "Telefone",
  "Status",
  "Ações",
];

/**
 * Dados e opções de filtro por prop, com os mocks como padrão. Com a API,
 * `aoNovaClinica`, `aoEditar(clinica)` e `aoExcluir(clinica)` ligam os botões.
 */
export default function AdminClinicasPage({
  clinicas = clinicasMock,
  metricas = metricasMock,
  filtrosEspecialidade = filtrosEspecialidadeMock,
  filtrosMunicipio = filtrosMunicipioMock,
  aviso = null,
  aoNovaClinica,
  aoEditar,
  aoExcluir,
}) {
  const [hoje] = useState(() => new Date());
  const tabela = useTabela({
    dados: clinicas,
    porPagina: 7,
    camposBusca: ["nome", "endereco", "especialidade", "municipio"],
    valoresIniciais: { status: "todos", especialidade: "todas", municipio: "todos" },
    filtros: {
      status: (item, valor) => item.status === valor,
      especialidade: (item, valor) => item.especialidade === valor,
      municipio: (item, valor) => item.municipio === valor,
    },
  });

  return (
    <>
      <CabecalhoPagina
        titulo="Clínicas"
        subtitulo="Gerencie as unidades de saúde cadastradas no sistema SaúdePlus."
        icone="clinica"
        data={hoje}
      />

      {aviso}

      <section className={comum.metricas} aria-label="Indicadores de clínicas">
        {metricas.map((m) => (
          <CartaoMetrica key={m.id} {...m} />
        ))}
      </section>

      <div className={comum.barraFiltros}>
        <CampoBusca
          valor={tabela.busca}
          aoMudar={tabela.aoBuscar}
          placeholder="Buscar clínica por nome, endereço ou especialidade..."
        />
        <Seletor
          className={comum.filtroCurto}
          rotulo="Status"
          valor={tabela.valores.status}
          aoMudar={(v) => tabela.definirFiltro("status", v)}
          opcoes={filtrosStatus}
        />
        <Seletor
          className={comum.filtroCurto}
          rotulo="Especialidade"
          valor={tabela.valores.especialidade}
          aoMudar={(v) => tabela.definirFiltro("especialidade", v)}
          opcoes={filtrosEspecialidade}
        />
        <Seletor
          className={comum.filtroCurto}
          rotulo="Município"
          valor={tabela.valores.municipio}
          aoMudar={(v) => tabela.definirFiltro("municipio", v)}
          opcoes={filtrosMunicipio}
        />
        <Botao icone="mais" onClick={aoNovaClinica}>Nova clínica</Botao>
      </div>

      <Cartao semPadding>
        <div style={{ padding: "8px 12px 12px" }}>
          <Tabela colunas={COLUNAS} vazio="Nenhuma clínica encontrada com esses filtros.">
            {tabela.visiveis.map((c, i) => {
              const status = statusClinica[c.status];
              return (
                <tr key={c.id}>
                  <td style={{ color: "var(--texto-3)", fontWeight: 600, width: 34 }}>
                    {tabela.mostrando.inicio + i}
                  </td>
                  <td>
                    <CelulaDupla principal={c.nome} icone="clinica" />
                  </td>
                  <td>{c.especialidade}</td>
                  <td>{c.endereco}</td>
                  <td>{c.municipio}</td>
                  <td>{c.telefone}</td>
                  <td>
                    <Etiqueta variante={status.variante} comPonto>
                      {status.rotulo}
                    </Etiqueta>
                  </td>
                  <td>
                    <AcoesLinha
                      acoes={
                        aoEditar
                          ? [
                              { icone: "lapis", rotulo: "Editar", aoClicar: () => aoEditar(c) },
                              ...(c.status !== "inativa"
                                ? [{ icone: "lixeira", rotulo: "Excluir", tom: "perigo", aoClicar: () => aoExcluir(c) }]
                                : []),
                            ]
                          : [
                              { icone: "olho", rotulo: "Ver detalhes" },
                              { icone: "lapis", rotulo: "Editar" },
                              { icone: "maisOpcoes", rotulo: "Mais opções", tom: "neutra" },
                            ]
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </Tabela>

          <RodapeTabela
            pagina={tabela.pagina}
            totalPaginas={tabela.totalPaginas}
            total={tabela.total}
            mostrando={tabela.mostrando}
            aoMudarPagina={tabela.definirPagina}
          />
        </div>
      </Cartao>
    </>
  );
}
