import { useEffect, useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import { CampoBusca, Seletor, Botao, Campo } from "./Controles";
import Modal, { GradeModal, RodapeModal } from "./Modal";
import {
  Tabela,
  CelulaDupla,
  CelulaIcone,
  AcoesLinha,
  RodapeTabela,
} from "./Tabela";
import useTabela from "../services/useTabela";
import {
  listarClinicas,
  criarClinica,
  atualizarClinica,
  excluirClinica,
} from "../features/clinicas/clinicas.api";
import { statusClinica } from "../services/dadosAdminClinicas";
import {
  unidadesCadastradas as unidadesMock,
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

const OPCOES_STATUS_FORM = Object.entries(statusClinica).map(([valor, s]) => ({
  valor,
  rotulo: s.rotulo,
}));

const FORM_VAZIO = {
  nome: "",
  especialidade: "",
  endereco: "",
  cidade: "",
  telefone: "",
  status: "ativa",
  cnpj: "",
  unidade: "",
  email: "",
  horarioFuncionamento: "",
};

function normalizar(item, index) {
  return {
    id: item.id ?? index + 1,
    nome: item.nome ?? "Clínica",
    especialidade: item.especialidade ?? "Clínica Geral",
    cnpj: item.cnpj ?? "00.000.000/0001-00",
    unidade: item.unidade ?? "Unidade Central",
    endereco: item.endereco ?? "Endereço não informado",
    cidade: item.cidade ?? "Saquarema",
    bairro: item.cidade ? `${item.cidade} - RJ` : "Saquarema - RJ",
    telefone: item.telefone ?? "(22) 00000-0000",
    email: item.email ?? "contato@saudeplus.com",
    funcionamento: (item.horarioFuncionamento ?? "Segunda a Sexta: 07:00 - 17:00").split(" · "),
    status: item.status ?? "ativa",
  };
}

export default function AdminConfigClinicas() {
  const [clinicas, setClinicas] = useState(unidadesMock);
  const [usandoApi, setUsandoApi] = useState(false);
  const [selecionada, definirSelecionada] = useState(null);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  function carregar() {
    return listarClinicas()
      .then((dados) => {
        const normalizadas = (Array.isArray(dados) ? dados : []).map(normalizar);
        const lista = normalizadas.length ? normalizadas : unidadesMock;
        setClinicas(lista);
        setUsandoApi(normalizadas.length > 0);
        definirSelecionada((atual) => {
          if (!atual) return lista[0] ?? null;
          return lista.find((c) => c.id === atual.id) ?? lista[0] ?? null;
        });
      })
      .catch(() => {
        setClinicas(unidadesMock);
        setUsandoApi(false);
        definirSelecionada(unidadesMock[0] ?? null);
      });
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabela = useTabela({
    dados: clinicas,
    porPagina: 7,
    camposBusca: ["nome", "cnpj", "unidade", "endereco"],
    valoresIniciais: { clinica: "todas", unidade: "todas" },
    filtros: {
      clinica: (item, valor) => item.status === valor,
      unidade: (item, valor) => item.unidade === valor,
    },
  });

  function abrirCriacao() {
    setForm(FORM_VAZIO);
    setErroForm("");
    setModal("criar");
  }

  function abrirEdicao(clinica) {
    setForm({
      nome: clinica.nome,
      especialidade: clinica.especialidade,
      endereco: clinica.endereco,
      cidade: clinica.cidade,
      telefone: clinica.telefone,
      status: clinica.status,
      cnpj: clinica.cnpj,
      unidade: clinica.unidade,
      email: clinica.email,
      horarioFuncionamento: clinica.funcionamento.join(" · "),
    });
    setErroForm("");
    setModal("editar");
  }

  function fecharModal() {
    setModal(null);
    setErroForm("");
  }

  function atualizarCampo(chave, valor) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  async function confirmar() {
    if (!usandoApi) {
      setErroForm("Conecte-se à API para gerenciar clínicas.");
      return;
    }
    if (!form.nome.trim() || !form.endereco.trim() || !form.cidade.trim() || !form.telefone.trim()) {
      setErroForm("Preencha nome, endereço, cidade e telefone.");
      return;
    }

    setSalvando(true);
    setErroForm("");
    try {
      if (modal === "criar") {
        await criarClinica({ ...form, especialidade: form.especialidade || "Clínica Geral" });
      } else if (modal === "editar" && selecionada) {
        await atualizarClinica(selecionada.id, { ...form, especialidade: form.especialidade || "Clínica Geral" });
      }
      fecharModal();
      await carregar();
    } catch (erro) {
      setErroForm(erro.message || "Não foi possível salvar a clínica.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(clinica) {
    if (!usandoApi) return;
    if (!window.confirm(`Excluir a clínica "${clinica.nome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setExcluindo(clinica.id);
    try {
      await excluirClinica(clinica.id);
      await carregar();
    } catch (erro) {
      window.alert(erro.message || "Não foi possível excluir a clínica.");
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <div className={estilos.gradePrincipal}>
      {/* ---------- lista ---------- */}
      <Cartao
        titulo="Clínicas e Unidades"
        icone="predio"
        extra={<Botao icone="mais" onClick={abrirCriacao}>Nova Clínica</Botao>}
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
              opcoes={filtrosUnidadeConfig}
              rotulo="Unidades"
            />
          </div>

          <Tabela colunas={COLUNAS} vazio="Nenhuma clínica encontrada.">
            {tabela.visiveis.map((c) => {
              const status = statusClinica[c.status] ?? statusClinica.ativa;
              return (
                <tr
                  key={c.id}
                  onClick={() => definirSelecionada(c)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <CelulaDupla
                      principal={c.nome}
                      secundario={`CNPJ: ${c.cnpj}`}
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
                            evento?.stopPropagation?.();
                            definirSelecionada(c);
                            abrirEdicao(c);
                          },
                        },
                        {
                          icone: "lixeira",
                          rotulo: "Excluir",
                          tom: "perigo",
                          aoClicar: (evento) => {
                            evento?.stopPropagation?.();
                            excluir(c);
                          },
                        },
                      ]}
                    />
                    {excluindo === c.id && (
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

      {/* ---------- detalhes ---------- */}
      <Cartao
        titulo="Detalhes da Clínica"
        icone="predio"
        extra={
          selecionada && (
            <Botao variante="secundario" icone="lapis" onClick={() => abrirEdicao(selecionada)}>
              Editar
            </Botao>
          )
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
                <Etiqueta variante={(statusClinica[selecionada.status] ?? statusClinica.ativa).variante}>
                  {(statusClinica[selecionada.status] ?? statusClinica.ativa).rotulo}
                </Etiqueta>
              </div>
            </div>

            <div className={estilos.campoDetalhe}>
              <Icone nome="predio" tam={15} className={estilos.campoIcone} />
              <span className={estilos.campoRotulo}>CNPJ</span>
              <span className={estilos.campoValor}>{selecionada.cnpj}</span>
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
              <span className={estilos.campoValor}>{selecionada.email}</span>
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
          </>
        )}
      </Cartao>

      {(modal === "criar" || modal === "editar") && (
        <Modal
          titulo={modal === "criar" ? "Nova clínica" : "Editar clínica"}
          subtitulo={modal === "criar" ? "Cadastre uma nova unidade de saúde." : `Editando ${selecionada?.nome}`}
          aoFechar={fecharModal}
          erro={erroForm}
          rodape={
            <RodapeModal
              aoCancelar={fecharModal}
              aoConfirmar={confirmar}
              carregando={salvando}
              rotuloConfirmar={modal === "criar" ? "Cadastrar" : "Salvar alterações"}
            />
          }
        >
          <GradeModal>
            <Campo rotulo="Nome da clínica" valor={form.nome} aoMudar={(v) => atualizarCampo("nome", v)} />
            <Campo rotulo="Unidade" valor={form.unidade} aoMudar={(v) => atualizarCampo("unidade", v)} />
          </GradeModal>
          <GradeModal>
            <Campo rotulo="Especialidade" valor={form.especialidade} aoMudar={(v) => atualizarCampo("especialidade", v)} />
            <Campo rotulo="CNPJ" valor={form.cnpj} aoMudar={(v) => atualizarCampo("cnpj", v)} />
          </GradeModal>
          <Campo rotulo="Endereço" valor={form.endereco} aoMudar={(v) => atualizarCampo("endereco", v)} />
          <GradeModal>
            <Campo rotulo="Cidade" valor={form.cidade} aoMudar={(v) => atualizarCampo("cidade", v)} />
            <Campo rotulo="Telefone" valor={form.telefone} aoMudar={(v) => atualizarCampo("telefone", v)} />
          </GradeModal>
          <GradeModal>
            <Campo rotulo="E-mail" tipo="email" valor={form.email} aoMudar={(v) => atualizarCampo("email", v)} />
            <Seletor
              rotulo="Status"
              valor={form.status}
              aoMudar={(v) => atualizarCampo("status", v)}
              opcoes={OPCOES_STATUS_FORM}
            />
          </GradeModal>
          <Campo
            rotulo="Funcionamento"
            valor={form.horarioFuncionamento}
            aoMudar={(v) => atualizarCampo("horarioFuncionamento", v)}
            placeholder="Segunda a Sexta: 07:00 - 17:00 · Sábado: 07:00 - 12:00"
          />
        </Modal>
      )}
    </div>
  );
}
