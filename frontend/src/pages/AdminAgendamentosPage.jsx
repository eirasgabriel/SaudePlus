import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import Avatar from "../components/Avatar";
import Calendario from "../components/Calendario";
import { CampoBusca, Seletor, Botao, Campo } from "../components/Controles";
import {
  Tabela,
  CelulaDupla,
  CelulaIcone,
  AcoesLinha,
  RodapeTabela,
} from "../components/Tabela";
import useTabela from "../services/useTabela";
import {
  metricas,
  agendamentos,
  statusAgendamento,
  tiposCalendario,
  marcacoesSetembro,
  filtrosClinica,
  filtrosProfissional,
} from "../services/dadosAdminAgendamentos";
import comum from "../styles/adminComum.module.css";

const COLUNAS = [
  "Data e horário",
  "Paciente",
  "Especialidade",
  "Profissional",
  "Unidade",
  "Status",
  "Ações",
];

export default function AdminAgendamentosPage() {
  const [periodo, definirPeriodo] = useState("2026-09-15");

  const tabela = useTabela({
    dados: agendamentos,
    porPagina: 7,
    camposBusca: ["paciente", "profissional", "especialidade", "cpf"],
    valoresIniciais: { clinica: "todas", profissional: "todos" },
    filtros: {
      clinica: (item, valor) => item.unidade === valor,
      profissional: (item, valor) => item.profissional === valor,
    },
  });

  return (
    <>
      <CabecalhoPagina
        titulo="Agendamentos"
        subtitulo="Gerencie os agendamentos de consultas e exames do sistema SaúdePlus."
        icone="calendario"
        data={new Date(2026, 8, 15)}
      />

      <section className={comum.metricas} aria-label="Indicadores de agendamentos">
        {metricas.map((m) => (
          <CartaoMetrica key={m.id} {...m} />
        ))}
      </section>

      <div className={comum.gradeLateral}>
        {/* ---------- coluna esquerda: calendário e filtros ---------- */}
        <div className={comum.colunaLateral}>
          <Cartao titulo="Calendário de Agendamentos" icone="calendario">
            <Calendario
              mesInicial={new Date(2026, 8, 1)}
              diaSelecionado={15}
              marcacoes={marcacoesSetembro}
              tipos={tiposCalendario}
            />
          </Cartao>

          <Cartao titulo="Filtros" icone="filtro">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Seletor
                valor={tabela.valores.clinica}
                aoMudar={(v) => tabela.definirFiltro("clinica", v)}
                opcoes={filtrosClinica}
                rotulo="Clínica"
              />
              <Seletor
                valor={tabela.valores.profissional}
                aoMudar={(v) => tabela.definirFiltro("profissional", v)}
                opcoes={filtrosProfissional}
                rotulo="Profissional"
              />
              <Campo
                rotulo="Data"
                tipo="date"
                valor={periodo}
                aoMudar={definirPeriodo}
                icone="calendario"
              />
              <Botao icone="busca" blocoTotal onClick={() => tabela.definirPagina(1)}>
                Aplicar filtros
              </Botao>
              <Botao variante="secundario" blocoTotal onClick={tabela.limpar}>
                Limpar
              </Botao>
            </div>
          </Cartao>
        </div>

        {/* ---------- coluna direita: busca e tabela ---------- */}
        <div className={comum.colunaLateral}>
          <div className={comum.barraFiltros} style={{ marginBottom: 0 }}>
            <CampoBusca
              valor={tabela.busca}
              aoMudar={tabela.aoBuscar}
              placeholder="Buscar paciente, profissional ou especialidade..."
            />
            <Botao icone="mais">Novo agendamento</Botao>
          </div>

          <Cartao semPadding>
            <div style={{ padding: "8px 12px 12px" }}>
              <Tabela
                colunas={COLUNAS}
                vazio="Nenhum agendamento encontrado com esses filtros."
              >
                {tabela.visiveis.map((a) => {
                  const status = statusAgendamento[a.status];
                  return (
                    <tr key={a.id}>
                      <td>
                        <CelulaDupla principal={a.data} secundario={a.hora} />
                      </td>
                      <td>
                        <CelulaDupla
                          principal={a.paciente}
                          secundario={a.cpf}
                          avatar={<Avatar nome={a.paciente} foto={a.foto} tam={34} />}
                        />
                      </td>
                      <td>{a.especialidade}</td>
                      <td>
                        <CelulaDupla principal={a.profissional} secundario={a.crm} />
                      </td>
                      <td>
                        <CelulaIcone icone="localizacao">
                          <span>
                            <span style={{ fontWeight: 600, color: "var(--texto)" }}>
                              {a.unidade}
                            </span>
                            <br />
                            <span style={{ fontSize: 11, color: "var(--texto-3)" }}>
                              {a.bairro}
                            </span>
                          </span>
                        </CelulaIcone>
                      </td>
                      <td>
                        <Etiqueta variante={status.variante} comPonto>
                          {status.rotulo}
                        </Etiqueta>
                      </td>
                      <td>
                        <AcoesLinha
                          acoes={[
                            { icone: "olho", rotulo: "Ver detalhes" },
                            { icone: "lapis", rotulo: "Editar" },
                            {
                              icone: "maisOpcoes",
                              rotulo: "Mais opções",
                              tom: "neutra",
                            },
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
        </div>
      </div>
    </>
  );
}
