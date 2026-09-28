import { useEffect, useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import Avatar from "../components/Avatar";
import { CampoBusca, Seletor, Botao, Campo } from "../components/Controles";
import Modal, { GradeModal, RodapeModal } from "../components/Modal";
import {
  Tabela,
  CelulaDupla,
  AcoesLinha,
  RodapeTabela,
} from "../components/Tabela";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
} from "../features/usuarios/usuarios.api";
import useTabela from "../services/useTabela";
import {
  metricas,
  usuarios as usuariosMock,
  perfisUsuario,
  statusUsuario,
  filtrosStatus,
  filtrosPerfil,
  filtrosUnidade,
} from "../services/dadosAdminUsuarios";
import comum from "../styles/adminComum.module.css";

const COLUNAS = [
  "Usuário",
  "CPF",
  "E-mail",
  "Telefone",
  "Perfil",
  "Status",
  "Último acesso",
  "Ações",
];

const OPCOES_PERFIL = Object.entries(perfisUsuario).map(([valor, p]) => ({
  valor,
  rotulo: p.rotulo,
}));

const OPCOES_STATUS = Object.entries(statusUsuario).map(([valor, s]) => ({
  valor,
  rotulo: s.rotulo,
}));

const FORM_VAZIO = {
  nome: "",
  email: "",
  senha: "",
  cargo: "",
  perfil: "paciente",
  status: "ativo",
  cpf: "",
  telefone: "",
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState(usuariosMock);
  const [carregando, setCarregando] = useState(true);
  const [usandoApi, setUsandoApi] = useState(false);

  const [modal, setModal] = useState(null); // "criar" | "editar" | "ver" | null
  const [selecionado, setSelecionado] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  function carregar() {
    return listarUsuarios()
      .then((dados) => {
        const normalizados = (Array.isArray(dados) ? dados : []).map((item, index) => ({
          id: item.id ?? index + 1,
          nome: item.nome ?? "Usuário",
          cargo: item.cargo ?? "Paciente",
          cpf: item.cpf ?? "000.000.000-00",
          email: item.email ?? "usuario@email.com",
          telefone: item.telefone ?? "(22) 00000-0000",
          perfil: item.perfil ?? "paciente",
          status: item.status ?? "ativo",
          ultimoAcesso: item.ultimoAcesso ?? "Sem registro",
          foto: item.foto ?? undefined,
        }));

        setUsuarios(normalizados.length ? normalizados : usuariosMock);
        setUsandoApi(true);
      })
      .catch(() => {
        setUsuarios(usuariosMock);
        setUsandoApi(false);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  const tabela = useTabela({
    dados: usuarios,
    porPagina: 7,
    camposBusca: ["nome", "cpf", "email"],
    valoresIniciais: { status: "todos", perfil: "todos", unidade: "todas" },
    filtros: {
      status: (item, valor) => item.status === valor,
      perfil: (item, valor) => item.perfil === valor,
      unidade: () => true,
    },
  });

  function abrirCriacao() {
    setForm(FORM_VAZIO);
    setErroForm("");
    setModal("criar");
  }

  function abrirEdicao(usuario) {
    setSelecionado(usuario);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      cargo: usuario.cargo,
      perfil: usuario.perfil,
      status: usuario.status,
      cpf: usuario.cpf,
      telefone: usuario.telefone,
    });
    setErroForm("");
    setModal("editar");
  }

  function abrirVisualizacao(usuario) {
    setSelecionado(usuario);
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

  async function confirmarUsuario() {
    if (!usandoApi) {
      setErroForm("Conecte-se à API (faça login novamente) para gerenciar usuários.");
      return;
    }
    if (!form.nome.trim() || !form.email.trim() || !form.cargo.trim()) {
      setErroForm("Preencha nome, e-mail e cargo.");
      return;
    }
    if (modal === "criar" && !form.senha.trim()) {
      setErroForm("Defina uma senha para o novo usuário.");
      return;
    }

    setSalvando(true);
    setErroForm("");
    try {
      if (modal === "criar") {
        await criarUsuario(form);
      } else if (modal === "editar" && selecionado) {
        await atualizarUsuario(selecionado.id, form);
      }
      fecharModal();
      await carregar();
    } catch (erro) {
      setErroForm(erro.message || "Não foi possível salvar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(usuario) {
    if (!usandoApi) return;
    if (!window.confirm(`Excluir o usuário "${usuario.nome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    setExcluindo(usuario.id);
    try {
      await excluirUsuario(usuario.id);
      await carregar();
    } catch (erro) {
      window.alert(erro.message || "Não foi possível excluir o usuário.");
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Usuários"
        subtitulo="Gerencie os usuários cadastrados no sistema SaúdePlus."
        icone="usuarios"
        data={new Date(2026, 8, 15)}
      />

      <section className={comum.metricas} aria-label="Indicadores de usuários">
        {metricas.map((m) => (
          <CartaoMetrica key={m.id} {...m} />
        ))}
      </section>

      <div className={comum.barraFiltros}>
        <CampoBusca
          valor={tabela.busca}
          aoMudar={tabela.aoBuscar}
          placeholder="Buscar usuário por nome, CPF ou e-mail"
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
          rotulo="Perfil"
          valor={tabela.valores.perfil}
          aoMudar={(v) => tabela.definirFiltro("perfil", v)}
          opcoes={filtrosPerfil}
        />
        <Seletor
          className={comum.filtroCurto}
          rotulo="Unidade"
          valor={tabela.valores.unidade}
          aoMudar={(v) => tabela.definirFiltro("unidade", v)}
          opcoes={filtrosUnidade}
        />
        <Botao icone="mais" onClick={abrirCriacao}>
          Novo usuário
        </Botao>
      </div>

      <Cartao semPadding>
        <div style={{ padding: "8px 12px 12px" }}>
          {carregando && (
            <div style={{ padding: "16px 12px 0", color: "var(--texto-3)" }}>
              Carregando usuários...
            </div>
          )}

          <Tabela colunas={COLUNAS} vazio="Nenhum usuário encontrado com esses filtros.">
            {tabela.visiveis.map((u) => {
              const perfil = perfisUsuario[u.perfil] ?? perfisUsuario.paciente;
              const status = statusUsuario[u.status] ?? statusUsuario.ativo;

              return (
                <tr key={u.id}>
                  <td>
                    <CelulaDupla
                      principal={u.nome}
                      secundario={u.cargo}
                      avatar={<Avatar nome={u.nome} foto={u.foto} tam={36} />}
                    />
                  </td>
                  <td>{u.cpf}</td>
                  <td>{u.email}</td>
                  <td>{u.telefone}</td>
                  <td>
                    <Etiqueta variante={perfil.variante}>{perfil.rotulo}</Etiqueta>
                  </td>
                  <td>
                    <Etiqueta variante={status.variante} comPonto>
                      {status.rotulo}
                    </Etiqueta>
                  </td>
                  <td>{u.ultimoAcesso}</td>
                  <td>
                    <AcoesLinha
                      acoes={[
                        { icone: "olho", rotulo: "Ver detalhes", aoClicar: () => abrirVisualizacao(u) },
                        { icone: "lapis", rotulo: "Editar", aoClicar: () => abrirEdicao(u) },
                        {
                          icone: "lixeira",
                          rotulo: "Excluir",
                          tom: "perigo",
                          aoClicar: () => excluir(u),
                        },
                      ]}
                    />
                    {excluindo === u.id && (
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
          titulo={modal === "criar" ? "Novo usuário" : "Editar usuário"}
          subtitulo={modal === "criar" ? "Cadastre um novo usuário no sistema." : `Editando ${selecionado?.nome}`}
          aoFechar={fecharModal}
          erro={erroForm}
          rodape={
            <RodapeModal
              aoCancelar={fecharModal}
              aoConfirmar={confirmarUsuario}
              carregando={salvando}
              rotuloConfirmar={modal === "criar" ? "Cadastrar" : "Salvar alterações"}
            />
          }
        >
          <Campo rotulo="Nome completo" valor={form.nome} aoMudar={(v) => atualizarCampo("nome", v)} />
          <GradeModal>
            <Campo rotulo="E-mail" tipo="email" valor={form.email} aoMudar={(v) => atualizarCampo("email", v)} />
            <Campo rotulo="Cargo" valor={form.cargo} aoMudar={(v) => atualizarCampo("cargo", v)} />
          </GradeModal>
          <GradeModal>
            <Campo rotulo="CPF" valor={form.cpf} aoMudar={(v) => atualizarCampo("cpf", v)} />
            <Campo rotulo="Telefone" valor={form.telefone} aoMudar={(v) => atualizarCampo("telefone", v)} />
          </GradeModal>
          <GradeModal>
            <Seletor
              rotulo="Perfil"
              valor={form.perfil}
              aoMudar={(v) => atualizarCampo("perfil", v)}
              opcoes={OPCOES_PERFIL}
            />
            <Seletor
              rotulo="Status"
              valor={form.status}
              aoMudar={(v) => atualizarCampo("status", v)}
              opcoes={OPCOES_STATUS}
            />
          </GradeModal>
          <Campo
            rotulo={modal === "criar" ? "Senha" : "Nova senha (opcional)"}
            tipo="password"
            valor={form.senha}
            aoMudar={(v) => atualizarCampo("senha", v)}
            placeholder={modal === "editar" ? "Deixe em branco para manter a atual" : ""}
          />
        </Modal>
      )}

      {modal === "ver" && selecionado && (
        <Modal
          titulo="Detalhes do usuário"
          subtitulo={selecionado.nome}
          aoFechar={fecharModal}
          rodape={<Botao variante="secundario" onClick={fecharModal}>Fechar</Botao>}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <Avatar nome={selecionado.nome} foto={selecionado.foto} tam={48} />
            <div>
              <strong>{selecionado.nome}</strong>
              <div style={{ fontSize: 13, color: "var(--texto-2)" }}>{selecionado.cargo}</div>
            </div>
          </div>
          <p><strong>E-mail:</strong> {selecionado.email}</p>
          <p><strong>Telefone:</strong> {selecionado.telefone}</p>
          <p><strong>CPF:</strong> {selecionado.cpf}</p>
          <p><strong>Perfil:</strong> {(perfisUsuario[selecionado.perfil] ?? perfisUsuario.paciente).rotulo}</p>
          <p><strong>Status:</strong> {(statusUsuario[selecionado.status] ?? statusUsuario.ativo).rotulo}</p>
          <p><strong>Último acesso:</strong> {selecionado.ultimoAcesso}</p>
        </Modal>
      )}
    </>
  );
}
