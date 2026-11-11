import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import Avatar from "../components/Avatar";
import Calendario from "../components/Calendario";
import DialogoConfirmacao from "../components/DialogoConfirmacao.jsx";
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
  metricas as metricasMock,
  agendamentos as agendamentosMock,
  statusAgendamento,
  tiposCalendario,
  marcacoesSetembro,
  filtrosClinica as filtrosClinicaMock,
  filtrosProfissional as filtrosProfissionalMock,
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

/**
 * Ações da linha com a API: confirmar o que está pendente, registrar a
 * chegada do confirmado e cancelar enquanto a consulta não começou.
 */
function acoesDoAgendamento(a, aoAlterarStatus, aoPedirCancelamento, hojeIso) {
  const acoes = [];
  if (a.status === "pendente") {
    acoes.push({ icone: "checkCirculo", rotulo: "Confirmar", aoClicar: () => aoAlterarStatus(a, "confirmada") });
  }
  /* Chegada só no dia: antes disso o paciente ainda não pode estar na recepção. */
  if (a.status === "confirmada" && (!a.dataIso || a.dataIso <= hojeIso)) {
    acoes.push({ icone: "usuario", rotulo: "Registrar chegada", aoClicar: () => aoAlterarStatus(a, "aguardando") });
  }
  if (a.status === "pendente" || a.status === "confirmada") {
    acoes.push({ icone: "alertaX", rotulo: "Cancelar", tom: "perigo", aoClicar: () => aoPedirCancelamento(a) });
  }
  return acoes;
}

/**
 * Dados por prop, com os mocks como padrão. `aoMudarMes` avisa a navegação
 * do calendário (para buscar as marcações do mês); `aoAlterarStatus(a, status)`
 * liga as ações da linha.
 */
export default function AdminAgendamentosPage({
  agendamentos = agendamentosMock,
  metricas = metricasMock,
  marcacoes = marcacoesSetembro,
  mesInicial = new Date(2026, 8, 1),
  diaSelecionado = 15,
  filtrosClinica = filtrosClinicaMock,
  filtrosProfissional = filtrosProfissionalMock,
  aviso = null,
  aoMudarMes,
  aoAlterarStatus,
  aoNovoAgendamento,
}) {
  const [hoje] = useState(() => new Date());
  const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  const [cancelando, definirCancelando] = useState(null);

  const tabela = useTabela({
    dados: agendamentos,
    porPagina: 7,
    camposBusca: ["paciente", "profissional", "especialidade", "cpf"],
    valoresIniciais: { clinica: "todas", profissional: "todos", data: "" },
    filtros: {
      clinica: (item, valor) => item.unidade === valor,
      profissional: (item, valor) => item.profissional === valor,
      data: (item, valor) => item.dataIso === valor,
    },
  });

  return (
    <>
      <CabecalhoPagina
        titulo="Agendamentos"
        subtitulo="Gerencie os agendamentos de consultas e exames do sistema SaúdePlus."
        icone="calendario"
        data={hoje}
      />

      {aviso}

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
              mesInicial={mesInicial}
              diaSelecionado={diaSelecionado}
              dataSelecionada={tabela.valores.data || null}
              marcacoes={marcacoes}
              tipos={tiposCalendario}
              aoMudarMes={aoMudarMes}
              aoSelecionarDia={(dia, referencia) => {
                const iso = `${referencia.getFullYear()}-${String(referencia.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                // Clicar de novo no dia marcado tira o filtro.
                tabela.definirFiltro("data", tabela.valores.data === iso ? "" : iso);
              }}
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
                valor={tabela.valores.data}
                aoMudar={(v) => tabela.definirFiltro("data", v)}
                icone="calendario"
              />
              <Botao variante="secundario" blocoTotal onClick={tabela.limpar}>
                Limpar filtros
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
            {aoNovoAgendamento && (
              <Botao icone="mais" onClick={aoNovoAgendamento}>Novo agendamento</Botao>
            )}
          </div>

          <Cartao semPadding>
            <div style={{ padding: "8px 12px 12px" }}>
              <Tabela
                colunas={COLUNAS}
                vazio="Nenhum agendamento encontrado com esses filtros."
              >
                {tabela.visiveis.map((a) => {
                  const status = statusAgendamento[a.status] ?? { rotulo: a.status, variante: "neutro" };
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
                          <span style={{ minWidth: 150, display: "inline-block" }}>
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
                        <Etiqueta variante={status.variante} status={a.status}>
                          {status.rotulo}
                        </Etiqueta>
                      </td>
                      <td>
                        <AcoesLinha
                          acoes={
                            aoAlterarStatus
                              ? acoesDoAgendamento(a, aoAlterarStatus, definirCancelando, hojeIso)
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
        </div>
      </div>

      <DialogoConfirmacao
        aberto={Boolean(cancelando)}
        aoFechar={() => definirCancelando(null)}
        titulo="Cancelar agendamento"
        mensagem={
          cancelando
            ? `Cancelar a consulta de ${cancelando.paciente} em ${cancelando.data} às ${cancelando.hora}? O paciente e o profissional são avisados, e não dá para desfazer.`
            : ""
        }
        rotuloConfirmar="Sim, cancelar"
        aoConfirmar={() => aoAlterarStatus(cancelando, "cancelada")}
      />
    </>
  );
}
