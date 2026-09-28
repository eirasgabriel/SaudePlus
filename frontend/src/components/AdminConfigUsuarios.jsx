import { useEffect, useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import Avatar from "./Avatar";
import { CampoBusca, Seletor, Botao, Campo } from "./Controles";
import Modal, { GradeModal, RodapeModal } from "./Modal";
import { Tabela, CelulaDupla, AcoesLinha, RodapeTabela } from "./Tabela";
import useTabela from "../services/useTabela";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
} from "../features/usuarios/usuarios.api";
import { statusUsuario } from "../services/dadosAdminUsuarios";
import {
  papeis,
  usuariosSistema as usuariosMock,
  modulosPermissao,
  colunasPermissao,
  permissoesIniciais,
} from "../services/dadosAdminConfiguracoes";
import estilos from "../styles/adminConfig.module.css";

const COLUNAS = ["Nome", "E-mail", "Papel", "Clínica/Unidade", "Status", "Ações"];

const opcoesPapel = [
  { valor: "todos", rotulo: "Todos os papéis" },
  ...papeis.map((p) => ({ valor: p.id, rotulo: p.rotulo })),
];

const opcoesStatus = [
  { valor: "todos", rotulo: "Todos os status" },
  { valor: "ativo", rotulo: "Ativos" },
  { valor: "inativo", rotulo: "Inativos" },
];

const OPCOES_PAPEL_FORM = papeis.map((p) => ({ valor: p.id, rotulo: p.rotulo }));
const OPCOES_STATUS_FORM = [
  { valor: "ativo", rotulo: "Ativo" },
  { valor: "inativo", rotulo: "Inativo" },
  { valor: "bloqueado", rotulo: "Bloqueado" },
];

const FORM_VAZIO = {
  nome: "",
  email: "",
  senha: "",
  cargo: "",
  perfil: "recepcionista",
  status: "ativo",
  unidade: "Todas",
};

function normalizar(item, index) {
  return {
    id: item.id ?? index + 1,
    nome: item.nome ?? "Usuário",
    cargo: item.cargo ?? "",
    email: item.email ?? "usuario@email.com",
    papel: item.perfil ?? item.papel ?? "recepcionista",
    unidade: item.unidade ?? "Todas",
    status: item.status ?? "ativo",
  };
}

export default function AdminConfigUsuarios() {
  const [permissoes, definirPermissoes] = useState(permissoesIniciais);
  const [usuarios, setUsuarios] = useState(usuariosMock);
  const [usandoApi, setUsandoApi] = useState(false);

  const [modal, setModal] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(null);

  function carregar() {
    return listarUsuarios()
      .then((dados) => {
        const normalizados = (Array.isArray(dados) ? dados : []).map(normalizar);
        setUsuarios(normalizados.length ? normalizados : usuariosMock);
        setUsandoApi(true);
      })
      .catch(() => {
        setUsuarios(usuariosMock);
        setUsandoApi(false);
      });
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabela = useTabela({
    dados: usuarios,
    porPagina: 7,
    camposBusca: ["nome", "email", "cargo"],
    valoresIniciais: { papel: "todos", status: "todos" },
    filtros: {
      papel: (item, valor) => item.papel === valor,
      status: (item, valor) => item.status === valor,
    },
  });

  /** Liga/desliga o acesso de um papel a um módulo (matriz local, não persistida). */
  function alternarPermissao(modulo, papel) {
    definirPermissoes((atuais) => ({
      ...atuais,
      [modulo]: { ...atuais[modulo], [papel]: !atuais[modulo][papel] },
    }));
  }

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
      perfil: usuario.papel,
      status: usuario.status,
      unidade: usuario.unidade,
    });
    setErroForm("");
    setModal("editar");
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
      setErroForm("Conecte-se à API para gerenciar usuários.");
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
    <div className={estilos.gradePrincipal}>
      {/* ---------- tabela de usuários ---------- */}
      <Cartao
        titulo="Usuários do Sistema"
        icone="usuarios"
        extra={<Botao icone="mais" onClick={abrirCriacao}>Novo usuário</Botao>}
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
              placeholder="Buscar por nome, e-mail ou cargo..."
            />
            <Seletor
              valor={tabela.valores.papel}
              aoMudar={(v) => tabela.definirFiltro("papel", v)}
              opcoes={opcoesPapel}
              rotulo="Papel"
            />
            <Seletor
              valor={tabela.valores.status}
              aoMudar={(v) => tabela.definirFiltro("status", v)}
              opcoes={opcoesStatus}
              rotulo="Status"
            />
          </div>

          <Tabela colunas={COLUNAS} vazio="Nenhum usuário encontrado.">
            {tabela.visiveis.map((u) => {
              const papel = papeis.find((p) => p.id === u.papel);
              const status = statusUsuario[u.status] ?? statusUsuario.ativo;
              return (
                <tr key={u.id}>
                  <td>
                    <CelulaDupla
                      principal={u.nome}
                      secundario={u.cargo}
                      avatar={<Avatar nome={u.nome} tam={34} />}
                    />
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Etiqueta variante={papel?.variante ?? "info"}>{papel?.rotulo ?? u.papel}</Etiqueta>
                  </td>
                  <td>{u.unidade}</td>
                  <td>
                    <Etiqueta variante={status.variante} comPonto>
                      {status.rotulo}
                    </Etiqueta>
                  </td>
                  <td>
                    <AcoesLinha
                      acoes={[
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

      {/* ---------- resumo dos papéis + matriz ---------- */}
      <div className={estilos.coluna}>
        <Cartao titulo="Resumo dos Papéis" icone="usuarios">
          {papeis.map((p) => (
            <div key={p.id} className={estilos.papel}>
              <span
                className={estilos.papelIcone}
                style={{
                  background: "var(--azul-claro)",
                  color: "var(--azul)",
                }}
              >
                <Icone nome={p.icone} tam={18} />
              </span>
              <div className={estilos.papelTexto}>
                <div className={estilos.papelNome}>{p.rotulo}</div>
                <div className={estilos.papelDesc}>{p.descricao}</div>
              </div>
              <span className={estilos.papelQtd}>
                {usuarios.filter((u) => u.papel === p.id).length}
              </span>
            </div>
          ))}
        </Cartao>

        <Cartao titulo="Permissões por Módulo" icone="escudoCheck">
          <div className={estilos.matrizWrap}>
            <table className={estilos.matriz}>
              <thead>
                <tr>
                  <th scope="col">Módulo</th>
                  {colunasPermissao.map((c) => (
                    <th key={c.id} scope="col">
                      {c.rotulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulosPermissao.map((modulo) => (
                  <tr key={modulo.id}>
                    <td>
                      <span className={estilos.moduloCelula}>
                        <Icone nome={modulo.icone} tam={16} />
                        {modulo.rotulo}
                      </span>
                    </td>
                    {colunasPermissao.map((coluna) => {
                      const ativo = permissoes[modulo.id]?.[coluna.id];
                      return (
                        <td key={coluna.id}>
                          <button
                            type="button"
                            className={`${estilos.marca} ${ativo ? estilos.marcaAtiva : ""}`}
                            onClick={() => alternarPermissao(modulo.id, coluna.id)}
                            aria-pressed={ativo}
                            aria-label={`${modulo.rotulo} — ${coluna.rotulo}: ${
                              ativo ? "liberado" : "bloqueado"
                            }`}
                          >
                            <Icone nome="check" tam={12} espessura={3} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>
      </div>

      {(modal === "criar" || modal === "editar") && (
        <Modal
          titulo={modal === "criar" ? "Novo usuário" : "Editar usuário"}
          subtitulo={modal === "criar" ? "Cadastre um novo usuário no sistema." : `Editando ${selecionado?.nome}`}
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
          <Campo rotulo="Nome completo" valor={form.nome} aoMudar={(v) => atualizarCampo("nome", v)} />
          <GradeModal>
            <Campo rotulo="E-mail" tipo="email" valor={form.email} aoMudar={(v) => atualizarCampo("email", v)} />
            <Campo rotulo="Cargo" valor={form.cargo} aoMudar={(v) => atualizarCampo("cargo", v)} />
          </GradeModal>
          <GradeModal>
            <Seletor
              rotulo="Papel"
              valor={form.perfil}
              aoMudar={(v) => atualizarCampo("perfil", v)}
              opcoes={OPCOES_PAPEL_FORM}
            />
            <Campo rotulo="Clínica/Unidade" valor={form.unidade} aoMudar={(v) => atualizarCampo("unidade", v)} />
          </GradeModal>
          <Seletor
            rotulo="Status"
            valor={form.status}
            aoMudar={(v) => atualizarCampo("status", v)}
            opcoes={OPCOES_STATUS_FORM}
          />
          <Campo
            rotulo={modal === "criar" ? "Senha" : "Nova senha (opcional)"}
            tipo="password"
            valor={form.senha}
            aoMudar={(v) => atualizarCampo("senha", v)}
            placeholder={modal === "editar" ? "Deixe em branco para manter a atual" : ""}
          />
        </Modal>
      )}
    </div>
  );
}
