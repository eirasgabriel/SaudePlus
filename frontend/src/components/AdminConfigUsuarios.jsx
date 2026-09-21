import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import Etiqueta from "./Etiqueta";
import Avatar from "./Avatar";
import { CampoBusca, Seletor, Botao } from "./Controles";
import { Tabela, CelulaDupla, AcoesLinha, RodapeTabela } from "./Tabela";
import useTabela from "../services/useTabela";
import {
  papeis,
  usuariosSistema,
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

export default function AdminConfigUsuarios() {
  const [permissoes, definirPermissoes] = useState(permissoesIniciais);

  const tabela = useTabela({
    dados: usuariosSistema,
    porPagina: 7,
    camposBusca: ["nome", "email", "cargo"],
    valoresIniciais: { papel: "todos", status: "todos" },
    filtros: {
      papel: (item, valor) => item.papel === valor,
      status: (item, valor) => item.status === valor,
    },
  });

  /** Liga/desliga o acesso de um papel a um módulo. */
  function alternarPermissao(modulo, papel) {
    definirPermissoes((atuais) => ({
      ...atuais,
      [modulo]: { ...atuais[modulo], [papel]: !atuais[modulo][papel] },
    }));
  }

  return (
    <div className={estilos.gradePrincipal}>
      {/* ---------- tabela de usuários ---------- */}
      <Cartao
        titulo="Usuários do Sistema"
        icone="usuarios"
        extra={<Botao icone="mais">Novo usuário</Botao>}
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
                    <Etiqueta variante={papel?.variante}>{papel?.rotulo}</Etiqueta>
                  </td>
                  <td>{u.unidade}</td>
                  <td>
                    <Etiqueta variante="sucesso" comPonto>
                      Ativo
                    </Etiqueta>
                  </td>
                  <td>
                    <AcoesLinha
                      acoes={[
                        { icone: "lapis", rotulo: "Editar" },
                        { icone: "lixeira", rotulo: "Excluir", tom: "perigo" },
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
              <span className={estilos.papelQtd}>{p.quantidade}</span>
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
    </div>
  );
}
