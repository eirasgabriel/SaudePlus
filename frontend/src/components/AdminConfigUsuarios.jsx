import { useState } from "react";
import Cartao from "./Cartao";
import Icone from "./Icone";
import { Botao } from "./Controles";
import {
  papeis,
  usuariosSistema,
  modulosPermissao,
  colunasPermissao,
  permissoesIniciais,
} from "../services/dadosAdminConfiguracoes";
import estilos from "../styles/adminConfig.module.css";

/**
 * `permissoes` (formato de `permissoesIniciais`) e `aoSalvarPermissoes`
 * ligam a matriz à API. Com a API, a coluna do administrador fica travada:
 * o servidor sempre libera tudo para ele.
 *
 * `usuarios` (formato de `usuariosSistema`) só alimenta a contagem do "Resumo
 * dos Papéis": a lista e a edição de usuários ficam na tela de Usuários.
 */
export default function AdminConfigUsuarios({
  permissoes: permissoesRecebidas = permissoesIniciais,
  aoSalvarPermissoes,
  usuarios = usuariosSistema,
}) {
  const [permissoes, definirPermissoes] = useState(permissoesRecebidas);
  const [salvando, definirSalvando] = useState(false);
  const [mensagem, definirMensagem] = useState(null);

  async function salvar() {
    definirSalvando(true);
    definirMensagem(null);
    try {
      await aoSalvarPermissoes(permissoes);
      definirMensagem("Permissões salvas. Valem a partir da próxima ação de cada pessoa.");
    } catch (erro) {
      definirMensagem(erro?.message ?? "Não foi possível salvar as permissões.");
    } finally {
      definirSalvando(false);
    }
  }

  /** Liga/desliga o acesso de um papel a um módulo. */
  function alternarPermissao(modulo, papel) {
    definirPermissoes((atuais) => ({
      ...atuais,
      [modulo]: { ...atuais[modulo], [papel]: !atuais[modulo][papel] },
    }));
  }

  return (
    // A lista de usuários fica na tela própria (Usuários); aqui, só papéis e permissões.
    <div className={estilos.somentePermissoes}>
      {/* ---------- resumo dos papéis + matriz ---------- */}
      <div className={estilos.coluna}>
        <Cartao titulo="Resumo dos Papéis" icone="usuarios">
          {papeis.map((p) => ({ ...p, quantidade: usuarios.filter((u) => u.papel === p.id).length })).map((p) => (
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

        <Cartao
          titulo="Permissões por Módulo"
          icone="escudoCheck"
          extra={
            aoSalvarPermissoes ? (
              <Botao icone="check" onClick={salvar} disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar"}
              </Botao>
            ) : null
          }
        >
          {mensagem && (
            <p role="status" style={{ margin: "0 0 12px", fontSize: 13 }}>
              {mensagem}
            </p>
          )}
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
                            disabled={Boolean(aoSalvarPermissoes) && coluna.id === "administrador"}
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
