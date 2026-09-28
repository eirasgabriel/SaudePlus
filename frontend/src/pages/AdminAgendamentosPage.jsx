import { useEffect, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import Avatar from "../components/Avatar";
import Calendario from "../components/Calendario";
import { CampoBusca, Seletor, Botao, Campo } from "../components/Controles";
import Modal, { GradeModal, RodapeModal } from "../components/Modal";
import {
  Tabela,
  CelulaDupla,
  CelulaIcone,
  AcoesLinha,
  RodapeTabela,
} from "../components/Tabela";
import {
  listarAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
} from "../features/agendamentos/agendamentos.api";
import { listarProfissionais } from "../features/profissionais/profissionais.api";
import useTabela from "../services/useTabela";
import {
  metricas,
  agendamentos as agendamentosMock,
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

const OPCOES_TIPO = [
  { valor: "Consulta", rotulo: "Consulta" },
  { valor: "Exame", rotulo: "Exame" },
  { valor: "Retorno", rotulo: "Retorno" },
];

const OPCOES_STATUS_FORM = [
  { valor: "pendente", rotulo: "Pendente / Em espera" },
  { valor: "confirmado", rotulo: "Confirmado" },
  { valor: "retorno", rotulo: "Retorno" },
  { valor: "cancelado", rotulo: "Cancelado" },
];

const FORM_VAZIO = {
  paciente: "",
  profissionalId: "",
  data: "",
  hora: "",
  tipo: "Consulta",
  status: "pendente",
};

function formatarData(data) {
  if (!data) return "Sem data";
  const dataObj = new Date(data);
  if (Number.isNaN(dataObj.getTime())) return data;
  return dataObj.toLocaleDateString("pt-BR");
}

function normalizarStatus(status) {
  if (status === "pendente") return "espera";
  if (["confirmado", "espera", "retorno", "cancelado"].includes(status)) {
    return status;
  }
  return "confirmado";
}

function normalizarAgendamento(item, index) {
  return {
    id: item.id ?? index + 1,
    dataOriginal: item.data ?? "",
    data: formatarData(item.data),
    hora: item.hora ?? "08:00",
    paciente: item.paciente ?? "Paciente",
    foto: item.foto ?? undefined,
    cpf: item.cpf ?? "000.000.000-00",
    especialidade: item.especialidade ?? (item.tipo === "Exame" ? "Exames Laboratoriais" : "Clínica Geral"),
    profissional: item.medico ?? item.profissional ?? "Profissional",
    profissionalId: item.profissionalId ?? null,
    crm: item.crm ?? "CRM 00000",
    unidade: item.unidade ?? "Clínica da Família",
    bairro: item.bairro ?? "Centro",
    tipo: item.tipo ?? "Consulta",
    statusOriginal: item.status ?? "pendente",
    status: normalizarStatus(item.status),
  };
}

export default function AdminAgendamentosPage() {
  const [periodo, definirPeriodo] = useState("2026-09-15");
  const [agendamentos, setAgendamentos] = useState(agendamentosMock);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usandoApi, setUsandoApi] = useState(false);

  const [modal, setModal] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  function carregar() {
    return Promise.allSettled([listarAgendamentos(), listarProfissionais()])
      .then(([agResult, profResult]) => {
        if (agResult.status === "fulfilled" && Array.isArray(agResult.value)) {
          const normalizados = agResult.value.map(normalizarAgendamento);
          setAgendamentos(normalizados.length ? normalizados : agendamentosMock);
          setUsandoApi(true);
        } else {
          setAgendamentos(agendamentosMock);
          setUsandoApi(false);
        }

        if (profResult.status === "fulfilled" && Array.isArray(profResult.value)) {
          setProfissionais(profResult.value);
        }
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

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

  function abrirCriacao() {
    setForm({ ...FORM_VAZIO, data: periodo });
    setErroForm("");
    setModal("criar");
  }

  function abrirEdicao(agendamento) {
    setSelecionado(agendamento);
    setForm({
      paciente: agendamento.paciente,
      profissionalId: agendamento.profissionalId ? String(agendamento.profissionalId) : "",
      data: agendamento.dataOriginal || "",
      hora: agendamento.hora,
      tipo: agendamento.tipo,
      status: agendamento.statusOriginal,
    });
    setErroForm("");
    setModal("editar");
  }

  function abrirVisualizacao(agendamento) {
    setSelecionado(agendamento);
    setModal("ver");
  }

  function fecharModal() {
    setModal(null);
    setSelecionado(null);
    setErroForm("");
  }

  function atualizarCampo(chave, valor) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  async function confirmar() {
    if (!usandoApi) {
      setErroForm("Conecte-se à API (faça login novamente) para gerenciar agendamentos.");
      return;
    }
    if (!form.paciente.trim() || !form.profissionalId || !form.data || !form.hora) {
      setErroForm("Preencha paciente, profissional, data e horário.");
      return;
    }

    setSalvando(true);
    setErroForm("");
    const payload = { ...form, profissionalId: Number(form.profissionalId) };
    try {
      if (modal === "criar") {
        await criarAgendamento(payload);
      } else if (modal === "editar" && selecionado) {
        await atualizarAgendamento(selecionado.id, payload);
      }
      fecharModal();
      await carregar();
    } catch (erro) {
      setErroForm(erro.message || "Não foi possível salvar o agendamento.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(agendamento) {
    if (!usandoApi) return;
    if (!window.confirm(`Excluir o agendamento de "${agendamento.paciente}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setExcluindo(agendamento.id);
    try {
      await excluirAgendamento(agendamento.id);
      await carregar();
    } catch (erro) {
      window.alert(erro.message || "Não foi possível excluir o agendamento.");
    } finally {
      setExcluindo(null);
    }
  }

  const opcoesProfissionaisForm = profissionais.map((p) => ({
    valor: String(p.id),
    rotulo: `${p.nome} — ${p.especialidade}`,
  }));

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
            <Botao icone="mais" onClick={abrirCriacao}>
              Novo agendamento
            </Botao>
          </div>

          <Cartao semPadding>
            <div style={{ padding: "8px 12px 12px" }}>
              {carregando && (
                <div style={{ padding: "16px 12px 0", color: "var(--texto-3)" }}>
                  Carregando agendamentos...
                </div>
              )}

              <Tabela
                colunas={COLUNAS}
                vazio="Nenhum agendamento encontrado com esses filtros."
              >
                {tabela.visiveis.map((a) => {
                  const status = statusAgendamento[a.status] ?? statusAgendamento.confirmado;
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
                            { icone: "olho", rotulo: "Ver detalhes", aoClicar: () => abrirVisualizacao(a) },
                            { icone: "lapis", rotulo: "Editar", aoClicar: () => abrirEdicao(a) },
                            {
                              icone: "lixeira",
                              rotulo: "Excluir",
                              tom: "perigo",
                              aoClicar: () => excluir(a),
                            },
                          ]}
                        />
                        {excluindo === a.id && (
                          <span style={{ fontSize: 11, color: "var(--texto-3)" }}>Excluindo...</span>
                        )}
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

      {(modal === "criar" || modal === "editar") && (
        <Modal
          titulo={modal === "criar" ? "Novo agendamento" : "Editar agendamento"}
          subtitulo={modal === "criar" ? "Cadastre uma nova consulta ou exame." : `Editando o agendamento de ${selecionado?.paciente}`}
          aoFechar={fecharModal}
          erro={erroForm}
          rodape={
            <RodapeModal
              aoCancelar={fecharModal}
              aoConfirmar={confirmar}
              carregando={salvando}
              rotuloConfirmar={modal === "criar" ? "Agendar" : "Salvar alterações"}
            />
          }
        >
          <Campo rotulo="Paciente" valor={form.paciente} aoMudar={(v) => atualizarCampo("paciente", v)} />
          <Seletor
            rotulo="Profissional"
            valor={form.profissionalId}
            aoMudar={(v) => atualizarCampo("profissionalId", v)}
            opcoes={[{ valor: "", rotulo: "Selecione um profissional" }, ...opcoesProfissionaisForm]}
          />
          <GradeModal>
            <Campo rotulo="Data" tipo="date" valor={form.data} aoMudar={(v) => atualizarCampo("data", v)} />
            <Campo rotulo="Horário" tipo="time" valor={form.hora} aoMudar={(v) => atualizarCampo("hora", v)} />
          </GradeModal>
          <GradeModal>
            <Seletor rotulo="Tipo" valor={form.tipo} aoMudar={(v) => atualizarCampo("tipo", v)} opcoes={OPCOES_TIPO} />
            <Seletor
              rotulo="Status"
              valor={form.status}
              aoMudar={(v) => atualizarCampo("status", v)}
              opcoes={OPCOES_STATUS_FORM}
            />
          </GradeModal>
        </Modal>
      )}

      {modal === "ver" && selecionado && (
        <Modal
          titulo="Detalhes do agendamento"
          subtitulo={selecionado.paciente}
          aoFechar={fecharModal}
          rodape={<Botao variante="secundario" onClick={fecharModal}>Fechar</Botao>}
        >
          <p><strong>Data:</strong> {selecionado.data} às {selecionado.hora}</p>
          <p><strong>Tipo:</strong> {selecionado.tipo}</p>
          <p><strong>Profissional:</strong> {selecionado.profissional}</p>
          <p><strong>Especialidade:</strong> {selecionado.especialidade}</p>
          <p><strong>Unidade:</strong> {selecionado.unidade}</p>
          <p><strong>Status:</strong> {(statusAgendamento[selecionado.status] ?? statusAgendamento.confirmado).rotulo}</p>
        </Modal>
      )}
    </>
  );
}
