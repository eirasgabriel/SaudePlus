import { useState } from "react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import CartaoMetrica from "../components/CartaoMetrica";
import Cartao from "../components/Cartao";
import Etiqueta from "../components/Etiqueta";
import Avatar from "../components/Avatar";
import { CampoBusca, Seletor, Botao } from "../components/Controles";
import {
  Tabela,
  CelulaDupla,
  AcoesLinha,
  RodapeTabela,
} from "../components/Tabela";
import useTabela from "../services/useTabela";
import {
  metricas as metricasMock,
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

/**
 * Dados por prop, com os mocks como padrão. `aoNovoUsuario` liga o botão
 * "Novo usuário"; `aoAlternarBloqueio(usuario)` liga o cadeado de cada linha.
 */
export default function AdminUsuariosPage({
  usuarios = usuariosMock,
  metricas = metricasMock,
  aviso = null,
  aoNovoUsuario,
  aoAlternarBloqueio,
}) {
  const [hoje] = useState(() => new Date());
  const tabela = useTabela({
    dados: usuarios,
    porPagina: 7,
    camposBusca: ["nome", "cpf", "email"],
    valoresIniciais: { status: "todos", perfil: "todos", unidade: "todas" },
    filtros: {
      status: (item, valor) => item.status === valor,
      perfil: (item, valor) => item.perfil === valor,
      // a unidade ainda não existe no mock de usuários; o filtro fica pronto
      unidade: () => true,
    },
  });

  return (
    <>
      <CabecalhoPagina
        titulo="Usuários"
        subtitulo="Gerencie os usuários cadastrados no sistema SaúdePlus."
        icone="usuarios"
        data={hoje}
      />

      {aviso}

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
        <Botao icone="mais" onClick={aoNovoUsuario}>Novo usuário</Botao>
      </div>

      <Cartao semPadding>
        <div style={{ padding: "8px 12px 12px" }}>
          <Tabela colunas={COLUNAS} vazio="Nenhum usuário encontrado com esses filtros.">
            {tabela.visiveis.map((u) => {
              const perfil = perfisUsuario[u.perfil] ?? { rotulo: u.perfil, variante: "neutro" };
              const status = statusUsuario[u.status];

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
                        { icone: "olho", rotulo: "Ver detalhes" },
                        { icone: "lapis", rotulo: "Editar" },
                        aoAlternarBloqueio
                          ? {
                              icone: "cadeado",
                              rotulo: u.status === "bloqueado" ? "Desbloquear" : "Bloquear",
                              tom: u.status === "bloqueado" ? "neutra" : "perigo",
                              aoClicar: () => aoAlternarBloqueio(u),
                            }
                          : { icone: "maisOpcoes", rotulo: "Mais opções", tom: "neutra" },
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
    </>
  );
}
