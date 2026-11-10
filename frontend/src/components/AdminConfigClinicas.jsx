import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import { CampoBusca, Seletor, Botao } from "./Controles";
import {
  Tabela,
  CelulaDupla,
  CelulaIcone,
  AcoesLinha,
  RodapeTabela,
} from "./Tabela";
import useTabela from "../services/useTabela";
import { statusClinica } from "../services/dadosAdminClinicas";
import {
  unidadesCadastradas,
  filtrosUnidadeConfig,
  filtrosClinicaConfig,
} from "../services/dadosAdminConfiguracoes";
import estilos from "../styles/adminConfig.module.css";

const COLUNAS = [
  "Nome da Clínica",
  "Unidade",
  "Endereço",
  "Telefone",
  "Status",
  "Ações",
];

/**
 * Sem props, é o protótipo com os mocks. Com a API, `unidades` (formato de
 * `unidadesCadastradas`) e `filtrosUnidade` trazem os cadastros reais, e
 * `aoNovaClinica`, `aoEditar(c)` e `aoExcluir(c)` ligam os botões.
 */
export default function AdminConfigClinicas({
  unidades = unidadesCadastradas,
  filtrosUnidade = filtrosUnidadeConfig,
  aoNovaClinica,
  aoEditar,
  aoExcluir,
}) {
  const [selecionadaId, definirSelecionadaId] = useState(unidades[0]?.id);
  const selecionada = unidades.find((u) => u.id === selecionadaId) ?? null;
  const definirSelecionada = (c) => definirSelecionadaId(c.id);

  const tabela = useTabela({
    dados: unidades,
    porPagina: 7,
    camposBusca: ["nome", "cnpj", "unidade", "endereco"],
    valoresIniciais: { clinica: "todas", unidade: "todas" },
    filtros: {
      clinica: (item, valor) => item.status === valor,
      unidade: (item, valor) => item.unidade === valor,
    },
  });

  return (
    <div className={estilos.gradePrincipal}>
      {/* ---------- lista ---------- */}
      <Cartao
        titulo="Clínicas e Unidades"
        icone="predio"
        extra={<Botao icone="mais" onClick={aoNovaClinica}>Nova Clínica</Botao>}
        semPadding
      >
        <div style={{ padding: "0 16px 12px" }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 14,
              alignItems: "flex-end",
            }}
          >
            <CampoBusca
              valor={tabela.busca}
              aoMudar={tabela.aoBuscar}
              placeholder="Buscar por nome da clínica, unidade ou CNPJ..."
            />
            <Seletor
              valor={tabela.valores.clinica}
              aoMudar={(v) => tabela.definirFiltro("clinica", v)}
              opcoes={filtrosClinicaConfig}
              rotulo="Clínicas"
            />
            <Seletor
              valor={tabela.valores.unidade}
              aoMudar={(v) => tabela.definirFiltro("unidade", v)}
              opcoes={filtrosUnidade}
              rotulo="Unidades"
            />
          </div>

          <Tabela colunas={COLUNAS} vazio="Nenhuma clínica encontrada.">
            {tabela.visiveis.map((c) => {
              const status = statusClinica[c.status];
              return (
                <tr
                  key={c.id}
                  onClick={() => definirSelecionada(c)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <CelulaDupla
                      principal={c.nome}
                      secundario={c.cnpj ? `CNPJ: ${c.cnpj}` : "CNPJ não informado"}
                      icone="predio"
                    />
                  </td>
                  <td>{c.unidade}</td>
                  <td>
                    <CelulaIcone icone="localizacao">
                      <span>
                        {c.endereco}
                        <br />
                        <span style={{ fontSize: 11, color: "var(--texto-3)" }}>
                          {c.bairro}
                        </span>
                      </span>
                    </CelulaIcone>
                  </td>
                  <td>
                    <CelulaIcone icone="telefone">{c.telefone}</CelulaIcone>
                  </td>
                  <td>
                    <Etiqueta variante={status.variante}>{status.rotulo}</Etiqueta>
                  </td>
                  <td>
                    <AcoesLinha
                      acoes={[
                        {
                          icone: "lapis",
                          rotulo: "Editar",
                          aoClicar: (evento) => {
                            evento.stopPropagation();
                            definirSelecionada(c);
                            aoEditar?.(c);
                          },
                        },
                        ...(c.status !== "inativa"
                          ? [{
                              icone: "lixeira",
                              rotulo: "Excluir",
                              tom: "perigo",
                              aoClicar: (evento) => {
                                evento.stopPropagation();
                                aoExcluir?.(c);
                              },
                            }]
                          : []),
                      ]}
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

      {/* ---------- detalhes ---------- */}
      <Cartao
        titulo="Detalhes da Clínica"
        icone="predio"
        extra={
          <Botao variante="secundario" icone="lapis" onClick={() => selecionada && aoEditar?.(selecionada)}>
            Editar
          </Botao>
        }
      >
        {!selecionada ? (
          <p className={estilos.semSelecao}>
            Selecione uma clínica na lista para ver os detalhes.
          </p>
        ) : (
          <>
            <div className={estilos.detalheTopo}>
              <span className={estilos.detalheIcone}>
                <Icone nome="predio" tam={26} />
              </span>
              <div>
                <div className={estilos.detalheNome}>{selecionada.nome}</div>
                <div className={estilos.detalheUnidade}>{selecionada.unidade}</div>
                <Etiqueta variante={statusClinica[selecionada.status].variante}>
                  {statusClinica[selecionada.status].rotulo}
                </Etiqueta>
              </div>
            </div>

            <div className={estilos.campoDetalhe}>
              <Icone nome="predio" tam={15} className={estilos.campoIcone} />
              <span className={estilos.campoRotulo}>CNPJ</span>
              <span className={estilos.campoValor}>{selecionada.cnpj || "Não informado"}</span>
            </div>
            <div className={estilos.campoDetalhe}>
              <Icone nome="localizacao" tam={15} className={estilos.campoIcone} />
              <span className={estilos.campoRotulo}>Endereço</span>
              <span className={estilos.campoValor}>
                {selecionada.endereco} — {selecionada.bairro}
              </span>
            </div>
            <div className={estilos.campoDetalhe}>
              <Icone nome="telefone" tam={15} className={estilos.campoIcone} />
              <span className={estilos.campoRotulo}>Telefone</span>
              <span className={estilos.campoValor}>{selecionada.telefone}</span>
            </div>
            <div className={estilos.campoDetalhe}>
              <Icone nome="email" tam={15} className={estilos.campoIcone} />
              <span className={estilos.campoRotulo}>E-mail</span>
              <span className={estilos.campoValor}>{selecionada.email || "Não informado"}</span>
            </div>
            <div className={estilos.campoDetalhe}>
              <Icone nome="relogio" tam={15} className={estilos.campoIcone} />
              <span className={estilos.campoRotulo}>Funcionamento</span>
              <span className={estilos.campoValor}>
                {selecionada.funcionamento.map((linha) => (
                  <span key={linha} style={{ display: "block" }}>
                    {linha}
                  </span>
                ))}
              </span>
            </div>

            {selecionada.vinculadas.length > 0 && (
              <div className={estilos.vinculadas}>
                <strong style={{ fontSize: 13, color: "var(--azul-escuro)" }}>
                  Unidades vinculadas
                </strong>
                {selecionada.vinculadas.map((u) => (
                  <div key={u.id} className={estilos.vinculadaLinha}>
                    <Icone nome="localizacao" tam={15} />
                    <span className={estilos.vinculadaNome}>{u.rotulo}</span>
                    <Etiqueta variante={statusClinica[u.status].variante}>
                      {statusClinica[u.status].rotulo}
                    </Etiqueta>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Cartao>
    </div>
  );
}
