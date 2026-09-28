import { useEffect, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import { CampoBusca, Seletor, Botao, Campo } from "../components/Controles";
import Modal, { GradeModal, RodapeModal } from "../components/Modal";
import {
  Tabela,
  CelulaDupla,
  AcoesLinha,
  RodapeTabela,
} from "../components/Tabela";
import {
  listarClinicas,
  criarClinica,
  atualizarClinica,
  excluirClinica,
} from "../features/clinicas/clinicas.api";
import useTabela from "../services/useTabela";
import {
  metricas,
  clinicas as clinicasMock,
  statusClinica,
  filtrosStatus,
  filtrosEspecialidade,
  filtrosMunicipio,
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

const OPCOES_STATUS = Object.entries(statusClinica).map(([valor, s]) => ({
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
};

function normalizar(item, index) {
  return {
    id: item.id ?? index + 1,
    nome: item.nome ?? "Clínica",
    especialidade: item.especialidade ?? "Clínica Geral",
    endereco: item.endereco ?? "Endereço não informado",
    cidade: item.cidade ?? "Saquarema",
    municipio: item.cidade ? `${item.cidade} - RJ` : item.municipio ?? "Saquarema - RJ",
    telefone: item.telefone ?? "(22) 00000-0000",
    status: item.status ?? "ativa",
  };
}

export default function AdminClinicasPage() {
  const [clinicas, setClinicas] = useState(clinicasMock);
  const [carregando, setCarregando] = useState(true);
  const [usandoApi, setUsandoApi] = useState(false);

  const [modal, setModal] = useState(null);
  const [selecionada, setSelecionada] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  function carregar() {
    return listarClinicas()
      .then((dados) => {
        const normalizadas = (Array.isArray(dados) ? dados : []).map(normalizar);
        setClinicas(normalizadas.length ? normalizadas : clinicasMock);
        setUsandoApi(true);
      })
      .catch(() => {
        setClinicas(clinicasMock);
        setUsandoApi(false);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

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

  function abrirCriacao() {
    setForm(FORM_VAZIO);
    setErroForm("");
    setModal("criar");
  }

  function abrirEdicao(clinica) {
    setSelecionada(clinica);
    setForm({
      nome: clinica.nome,
      especialidade: clinica.especialidade,
      endereco: clinica.endereco,
      cidade: clinica.cidade,
      telefone: clinica.telefone,
      status: clinica.status,
    });
    setErroForm("");
    setModal("editar");
  }

  function abrirVisualizacao(clinica) {
    setSelecionada(clinica);
    setModal("ver");
  }

  function fecharModal() {
    setModal(null);
    setSelecionada(null);
    setErroForm("");
  }

  function atualizarCampo(chave, valor) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
  }

  async function confirmar() {
    if (!usandoApi) {
      setErroForm("Conecte-se à API (faça login novamente) para gerenciar clínicas.");
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
        await criarClinica(form);
      } else if (modal === "editar" && selecionada) {
        await atualizarClinica(selecionada.id, form);
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
    <>
      <CabecalhoPagina
        titulo="Clínicas"
        subtitulo="Gerencie as unidades de saúde cadastradas no sistema SaúdePlus."
        icone="clinica"
        data={new Date(2026, 8, 15)}
      />

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
        <Botao icone="mais" onClick={abrirCriacao}>
          Nova clínica
        </Botao>
      </div>

      <Cartao semPadding>
        <div style={{ padding: "8px 12px 12px" }}>
          {carregando && (
            <div style={{ padding: "16px 12px 0", color: "var(--texto-3)" }}>
              Carregando clínicas...
            </div>
          )}

          <Tabela colunas={COLUNAS} vazio="Nenhuma clínica encontrada com esses filtros.">
            {tabela.visiveis.map((c, i) => {
              const status = statusClinica[c.status] ?? statusClinica.ativa;
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
                      acoes={[
                        { icone: "olho", rotulo: "Ver detalhes", aoClicar: () => abrirVisualizacao(c) },
                        { icone: "lapis", rotulo: "Editar", aoClicar: () => abrirEdicao(c) },
                        {
                          icone: "lixeira",
                          rotulo: "Excluir",
                          tom: "perigo",
                          aoClicar: () => excluir(c),
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
          <Campo rotulo="Nome da clínica" valor={form.nome} aoMudar={(v) => atualizarCampo("nome", v)} />
          <GradeModal>
            <Campo rotulo="Especialidade" valor={form.especialidade} aoMudar={(v) => atualizarCampo("especialidade", v)} />
            <Campo rotulo="Telefone" valor={form.telefone} aoMudar={(v) => atualizarCampo("telefone", v)} />
          </GradeModal>
          <Campo rotulo="Endereço" valor={form.endereco} aoMudar={(v) => atualizarCampo("endereco", v)} />
          <GradeModal>
            <Campo rotulo="Cidade" valor={form.cidade} aoMudar={(v) => atualizarCampo("cidade", v)} />
            <Seletor
              rotulo="Status"
              valor={form.status}
              aoMudar={(v) => atualizarCampo("status", v)}
              opcoes={OPCOES_STATUS}
            />
          </GradeModal>
        </Modal>
      )}

      {modal === "ver" && selecionada && (
        <Modal
          titulo="Detalhes da clínica"
          subtitulo={selecionada.nome}
          aoFechar={fecharModal}
          rodape={<Botao variante="secundario" onClick={fecharModal}>Fechar</Botao>}
        >
          <p><strong>Especialidade:</strong> {selecionada.especialidade}</p>
          <p><strong>Endereço:</strong> {selecionada.endereco}</p>
          <p><strong>Município:</strong> {selecionada.municipio}</p>
          <p><strong>Telefone:</strong> {selecionada.telefone}</p>
          <p><strong>Status:</strong> {(statusClinica[selecionada.status] ?? statusClinica.ativa).rotulo}</p>
        </Modal>
      )}
    </>
  );
}
