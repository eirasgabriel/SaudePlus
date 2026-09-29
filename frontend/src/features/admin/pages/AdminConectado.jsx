import { useCallback, useMemo, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";

import AdminLayout from "../../../layouts/AdminLayout";
import AdminDashboardPage from "../../../pages/AdminDashboardPage";
import AdminUsuariosPage from "../../../pages/AdminUsuariosPage";
import AdminClinicasPage from "../../../pages/AdminClinicasPage";
import AdminAgendamentosPage from "../../../pages/AdminAgendamentosPage";
import AdminConfiguracoesPage from "../../../pages/AdminConfiguracoesPage";
import AdminFinanceiroPage from "../../../pages/AdminFinanceiroPage";
import AdminRelatoriosPage from "../../../pages/AdminRelatoriosPage";
import AvisoDeOrigem from "../../medico/components/AvisoDeOrigem/AvisoDeOrigem.jsx";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import { useAuth } from "../../auth/auth.context.js";
import AvisoDoAdmin from "../components/AvisoDoAdmin.jsx";
import DialogoAuditoria from "../components/DialogoAuditoria.jsx";
import ModalConvenios from "../components/ModalConvenios.jsx";
import ModalFormasPagamento from "../components/ModalFormasPagamento.jsx";
import * as api from "../admin.api.js";
import { useEdicaoDeUnidades, useEdicaoDeUsuarios } from "../useEdicaoDeCadastros.jsx";
import NotificacoesDoAdmin from "./NotificacoesDoAdmin.jsx";
import {
  metricasDeAgendamentos,
  metricasDeClinicas,
  metricasDeUsuarios,
  mesesDoPeriodo,
  opcoesDe,
  paraAgendamento,
  paraClinica,
  paraDashboard,
  paraFinanceiro,
  paraMarcacoes,
  paraRelatorios,
  paraTransacao,
  paraUnidadeDaConfiguracao,
  paraUsuario,
  paraUsuarioDaEquipe,
} from "../adaptadores.js";
import { dataHoraBr } from "../../../utils/formatos.js";
import { metricas as modelosUsuarios } from "../../../services/dadosAdminUsuarios";
import { metricas as modelosClinicas } from "../../../services/dadosAdminClinicas";
import { metricas as modelosAgendamentos } from "../../../services/dadosAdminAgendamentos";
import * as modelosDashboard from "../../../services/dadosAdminDashboard";
import * as modelosFinanceiro from "../../../services/dadosAdminFinanceiro";
import * as modelosRelatorios from "../../../services/dadosAdminRelatorios";

/* Telas do admin ligadas à API. Cada uma busca os dados, converte para o
   formato que a página já recebia dos mocks e, se a API falhar, deixa a
   página nos mocks com a faixa de demonstração. Ações só existem com a API. */

const ROTULO_DO_PAPEL = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ENFERMEIRO: "Enfermagem",
  RECEPCIONISTA: "Recepção",
  AGENTE: "Agente comunitário",
};

/** Mensagem de retorno de ação, com o tom certo. */
function useRetorno() {
  const [retorno, definirRetorno] = useState(null);
  const sucesso = useCallback((texto) => definirRetorno({ tom: "sucesso", texto }), []);
  const erro = useCallback((falha) => definirRetorno({ tom: "erro", texto: falha?.message ?? "Algo deu errado." }), []);
  const aviso = retorno ? <AvisoDoAdmin tom={retorno.tom}>{retorno.texto}</AvisoDoAdmin> : null;
  return { aviso, sucesso, erro };
}

const carregarModulos = ({ sinal }) => api.buscarModulos({ sinal });

/**
 * Casca do admin: menu filtrado pelos módulos liberados, o nome de quem está
 * logado e o contador do sino, relido a cada troca de página.
 */
export function LayoutDoAdmin() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const { origem, dados } = useDadosDaApi(carregarModulos);
  // `pathname` na dependência: trocar de página relê o contador.
  const carregarContagem = useCallback(
    ({ sinal }) => api.contarNotificacoesNaoLidas({ sinal }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname],
  );
  const contagem = useDadosDaApi(carregarContagem);
  const contexto = useMemo(() => ({ recarregarNaoLidas: contagem.recarregar }), [contagem.recarregar]);
  return (
    <AdminLayout
      modulos={origem === "api" ? dados : null}
      contexto={contexto}
      usuario={{
        nome: usuario?.nomeCompleto ?? "Administração",
        cargo: ROTULO_DO_PAPEL[usuario?.role] ?? "Equipe",
        foto: usuario?.fotoUrl ?? null,
        naoLidas: contagem.origem === "api" ? contagem.dados.total : 0,
      }}
    />
  );
}

/** Notificações de quem está logado; marcar como lida já atualiza o sino. */
export function NotificacoesDoAdminConectado() {
  const contexto = useOutletContext();
  return <NotificacoesDoAdmin aoMudar={contexto?.recarregarNaoLidas} />;
}

/* ------------------------------------------------------------ dashboard */

export function DashboardDoAdmin() {
  const { usuario } = useAuth();
  const [meses, definirMeses] = useState(9);
  const carregar = useCallback(({ sinal }) => api.buscarDashboard({ meses, sinal }), [meses]);
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregar);
  const props = origem === "api" && dados ? paraDashboard(modelosDashboard, dados) : {};
  return (
    <AdminDashboardPage
      usuario={{ nome: usuario?.nomeCompleto ?? "Admin" }}
      {...props}
      aviso={<AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />}
      aoMudarPeriodo={(periodo) => definirMeses(mesesDoPeriodo(periodo))}
    />
  );
}

/* ------------------------------------------------------------ usuários */

const carregarUsuarios = async ({ sinal }) => {
  const [pagina, metricas, especialidades, unidades] = await Promise.all([
    api.listarUsuarios({ sinal }),
    api.buscarMetricasDeUsuarios({ sinal }),
    api.listarEspecialidades({ sinal }).catch(() => []),
    api.listarUnidades({ sinal }).catch(() => []),
  ]);
  return { pagina, metricas, especialidades, unidades };
};

export function UsuariosDoAdmin() {
  const { usuario } = useAuth();
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarUsuarios);
  const retorno = useRetorno();
  const comApi = origem === "api" && dados;
  const edicao = useEdicaoDeUsuarios({
    especialidades: comApi ? dados.especialidades : [],
    unidades: comApi ? dados.unidades : [],
    podeCriarAdmin: usuario?.role === "ADMIN",
    aoConcluir: (texto) => {
      retorno.sucesso(texto);
      recarregar();
    },
  });
  // As linhas da tabela são o formato do mock; as ações precisam da conta da API.
  const daApi = (linha) => dados.pagina.conteudo.find((u) => u.id === linha.id);

  const alternarBloqueio = async (u) => {
    const novo = u.status === "bloqueado" ? "ativo" : "bloqueado";
    try {
      await api.alterarStatusDoUsuario(u.id, novo);
      retorno.sucesso(`${u.nome} ${novo === "bloqueado" ? "bloqueado(a)" : "desbloqueado(a)"}.`);
      recarregar();
    } catch (falha) {
      retorno.erro(falha);
    }
  };

  return (
    <>
      <AdminUsuariosPage
        {...(comApi
          ? {
              usuarios: dados.pagina.conteudo.map(paraUsuario),
              metricas: metricasDeUsuarios(modelosUsuarios, dados.metricas),
            }
          : {})}
        aviso={
          <>
            <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
            {retorno.aviso}
          </>
        }
        aoNovoUsuario={comApi ? edicao.novo : undefined}
        aoAlternarBloqueio={comApi ? alternarBloqueio : undefined}
        aoEditar={comApi ? (linha) => edicao.editar(daApi(linha)) : undefined}
        aoExcluir={comApi ? (linha) => edicao.excluir(daApi(linha)) : undefined}
      />
      {comApi && edicao.elementos}
    </>
  );
}

/* ------------------------------------------------------------ clínicas */

const carregarClinicas = async ({ sinal }) => {
  const [unidades, metricas] = await Promise.all([
    api.listarUnidades({ sinal }),
    api.buscarMetricasDeUnidades({ sinal }),
  ]);
  return { unidades, metricas };
};

export function ClinicasDoAdmin() {
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarClinicas);
  const retorno = useRetorno();
  const comApi = origem === "api" && dados;
  const clinicas = comApi ? dados.unidades.map(paraClinica) : null;
  const edicao = useEdicaoDeUnidades({
    aoConcluir: (texto) => {
      retorno.sucesso(texto);
      recarregar();
    },
  });
  const daApi = (linha) => dados.unidades.find((u) => u.id === linha.id);
  return (
    <>
      <AdminClinicasPage
        {...(comApi
          ? {
              clinicas,
              metricas: metricasDeClinicas(modelosClinicas, dados.metricas),
              filtrosEspecialidade: opcoesDe(clinicas, "especialidade", "Todas", "todas"),
              filtrosMunicipio: opcoesDe(clinicas, "municipio", "Todos"),
              aoNovaClinica: edicao.nova,
              aoEditar: (linha) => edicao.editar(daApi(linha)),
              aoExcluir: (linha) => edicao.excluir(daApi(linha)),
            }
          : {})}
        aviso={
          <>
            <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
            {retorno.aviso}
          </>
        }
      />
      {comApi && edicao.elementos}
    </>
  );
}

/* ------------------------------------------------------------ agendamentos */

/** "2026-09" do mês da data. */
const mesDe = (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

export function AgendamentosDoAdmin() {
  const [hoje] = useState(() => new Date());
  const [mes, definirMes] = useState(() => mesDe(new Date()));
  const retorno = useRetorno();

  // Lista a partir do mês anterior: o que já passou recentemente e tudo o que vem.
  const carregarLista = useCallback(async ({ sinal }) => {
    const de = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const [pagina, metricas] = await Promise.all([
      api.listarAgendamentos({ de: `${mesDe(de)}-01`, sinal }),
      api.buscarMetricasDeAgendamentos({ sinal }),
    ]);
    return { pagina, metricas };
  }, [hoje]);
  const carregarCalendario = useCallback(({ sinal }) => api.buscarCalendario({ mes, sinal }), [mes]);

  const lista = useDadosDaApi(carregarLista);
  const calendario = useDadosDaApi(carregarCalendario);
  const comApi = lista.origem === "api" && lista.dados;
  const agendamentos = comApi ? lista.dados.pagina.conteudo.map(paraAgendamento) : null;

  const alterarStatus = async (a, status) => {
    try {
      await api.alterarStatusDoAgendamento(a.id, status);
      const verbo = { confirmada: "confirmado", aguardando: "com chegada registrada", cancelada: "cancelado" }[status];
      retorno.sucesso(`Agendamento de ${a.paciente} ${verbo ?? "atualizado"}.`);
      lista.recarregar();
      calendario.recarregar();
    } catch (falha) {
      retorno.erro(falha);
    }
  };

  return (
    <AdminAgendamentosPage
      {...(comApi
        ? {
            agendamentos,
            metricas: metricasDeAgendamentos(modelosAgendamentos, lista.dados.metricas),
            filtrosClinica: opcoesDe(agendamentos, "unidade", "Todas", "todas"),
            filtrosProfissional: opcoesDe(agendamentos, "profissional", "Todos"),
            marcacoes: calendario.origem === "api" && calendario.dados ? paraMarcacoes(calendario.dados) : {},
            mesInicial: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
            diaSelecionado: hoje.getDate(),
            periodoInicial: `${mesDe(hoje)}-${String(hoje.getDate()).padStart(2, "0")}`,
          }
        : {})}
      aviso={
        <>
          <AvisoDeOrigem origem={lista.origem} erro={lista.erro} aoTentarDeNovo={lista.recarregar} />
          {retorno.aviso}
        </>
      }
      aoMudarMes={comApi ? (data) => definirMes(mesDe(data)) : undefined}
      aoAlterarStatus={comApi ? alterarStatus : undefined}
    />
  );
}

/* ------------------------------------------------------------ financeiro e relatórios */

/** "2026-09-28" no fuso do navegador. */
const isoDe = (data) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;

/** Período do seletor ("7d", "90d", "ano") → { de, ate } terminando hoje. */
function intervaloDe(periodo, hoje) {
  if (periodo === "ano") return { de: `${hoje.getFullYear()}-01-01`, ate: isoDe(hoje) };
  const dias = Number.parseInt(periodo, 10) || 30;
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - (dias - 1));
  return { de: isoDe(inicio), ate: isoDe(hoje) };
}

export function FinanceiroDoAdmin() {
  const [hoje] = useState(() => new Date());
  const [periodo, definirPeriodo] = useState("7d");
  const retorno = useRetorno();
  const intervalo = intervaloDe(periodo, hoje);
  const carregar = useCallback(async ({ sinal }) => {
    const { de, ate } = intervaloDe(periodo, hoje);
    const [resumo, pagina] = await Promise.all([
      api.buscarResumoFinanceiro({ de, ate, sinal }),
      api.listarTransacoes({ de, ate, sinal }),
    ]);
    return { resumo, pagina };
  }, [periodo, hoje]);
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregar);
  const comApi = origem === "api" && dados;
  const [modal, definirModal] = useState(null); // "formas" | "convenios"

  const acaoRapida = async (id) => {
    if (id === "formas" || id === "convenios") {
      definirModal(id);
      return;
    }
    if (id !== "relatorio") {
      // Nota fiscal depende de integração com a prefeitura/SEFAZ: fora do escopo.
      retorno.erro({ message: "A emissão de nota fiscal ainda não está disponível." });
      return;
    }
    try {
      await api.exportarFinanceiro({ ...intervalo, formato: "pdf" });
      retorno.sucesso("Relatório financeiro gerado.");
    } catch (falha) {
      retorno.erro(falha);
    }
  };

  return (
    <>
      <AdminFinanceiroPage
        {...(comApi
          ? { ...paraFinanceiro(modelosFinanceiro, dados.resumo), transacoes: dados.pagina.conteudo.map(paraTransacao) }
          : {})}
        aviso={
          <>
            <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
            {retorno.aviso}
          </>
        }
        aoMudarPeriodo={definirPeriodo}
        aoAcaoRapida={comApi ? acaoRapida : undefined}
      />
      <ModalFormasPagamento
        aberto={modal === "formas"}
        aoFechar={() => definirModal(null)}
        aoSalvar={() => retorno.sucesso("Formas de pagamento atualizadas.")}
      />
      <ModalConvenios aberto={modal === "convenios"} aoFechar={() => definirModal(null)} />
    </>
  );
}

/** Status do filtro da tela → status da API. */
const STATUS_DO_FILTRO = { confirmado: "confirmada", espera: "pendente", cancelado: "cancelada" };

/** Opções de um seletor com ids da API, mantendo o "todos" do mock no topo. */
const opcoesComIds = (itens, todos) => [todos, ...itens.map((i) => ({ valor: i.id, rotulo: i.nome }))];

const carregarOpcoesDosRelatorios = async ({ sinal }) => {
  const [medicos, unidades, especialidades] = await Promise.all([
    api.listarUsuarios({ papel: "MEDICO", sinal }),
    api.listarUnidades({ sinal }),
    api.listarEspecialidades({ sinal }),
  ]);
  return {
    opcoesProfissional: opcoesComIds(
      medicos.conteudo.filter((u) => u.medico).map((u) => ({ id: u.medico.id, nome: u.nome })),
      modelosRelatorios.opcoesProfissional[0],
    ),
    opcoesUnidade: opcoesComIds(unidades, modelosRelatorios.opcoesUnidade[0]),
    opcoesEspecialidade: opcoesComIds(especialidades, modelosRelatorios.opcoesEspecialidade[0]),
  };
};

export function RelatoriosDoAdmin() {
  const [hoje] = useState(() => new Date());
  const [periodo, definirPeriodo] = useState("30d");
  const carregarResumo = useCallback(
    ({ sinal }) => api.buscarResumoDeRelatorios({ ...intervaloDe(periodo, hoje), sinal }),
    [periodo, hoje],
  );
  const resumo = useDadosDaApi(carregarResumo);
  const opcoes = useDadosDaApi(carregarOpcoesDosRelatorios);
  const comApi = resumo.origem === "api" && resumo.dados;
  const comOpcoes = opcoes.origem === "api" && opcoes.dados;

  /** Cartões usam o período do topo; o relatório personalizado, os filtros avançados. */
  const gerar = async (id, filtros) => {
    if (id === "financeiro") {
      await api.exportarFinanceiro({ ...intervaloDe(periodo, hoje), formato: filtros.formato });
      return;
    }
    if (id !== "personalizado") {
      await api.exportarRelatorio(id, { ...intervaloDe(periodo, hoje), formato: filtros.formato });
      return;
    }
    const selecionado = (valor) => (valor && !["todos", "todas"].includes(valor) ? valor : undefined);
    await api.exportarRelatorio("agendamentos", {
      de: filtros.inicio,
      ate: filtros.fim,
      status: STATUS_DO_FILTRO[filtros.status],
      medicoId: selecionado(filtros.profissional),
      unidadeId: selecionado(filtros.unidade),
      especialidadeId: selecionado(filtros.especialidade),
      formato: filtros.formato,
    });
  };

  return (
    <AdminRelatoriosPage
      // Remonta quando as opções chegam: os filtros guardam ids em estado próprio.
      key={comOpcoes ? "api" : "mocks"}
      {...(comApi ? paraRelatorios(modelosRelatorios, resumo.dados) : {})}
      {...(comOpcoes ? opcoes.dados : {})}
      filtrosIniciais={{
        inicio: intervaloDe("30d", hoje).de,
        fim: isoDe(hoje),
        profissional: "todos",
        unidade: "todas",
        status: "todos",
        especialidade: "todas",
        formato: "pdf",
      }}
      aviso={<AvisoDeOrigem origem={resumo.origem} erro={resumo.erro} aoTentarDeNovo={resumo.recarregar} />}
      aoMudarPeriodo={definirPeriodo}
      aoGerar={comApi ? gerar : undefined}
    />
  );
}

/* ------------------------------------------------------------ configurações */

/** Colunas da matriz na tela → papéis da API. */
const PAPEL_DA_COLUNA = { gestor: "GESTOR", medico: "MEDICO", enfermeiro: "ENFERMEIRO", recepcionista: "RECEPCIONISTA" };

function matrizDaTela(api) {
  return Object.fromEntries(
    Object.entries(api.matriz).map(([modulo, porPapel]) => [
      modulo,
      {
        administrador: true,
        ...Object.fromEntries(Object.entries(PAPEL_DA_COLUNA).map(([coluna, papel]) => [coluna, Boolean(porPapel[papel])])),
      },
    ]),
  );
}

/** Volta para o formato da API, preservando os papéis que a tela não mostra (ex.: AGENTE). */
function matrizDaApi(tela, original) {
  return Object.fromEntries(
    Object.entries(original.matriz).map(([modulo, porPapel]) => [
      modulo,
      {
        ...porPapel,
        ...Object.fromEntries(Object.entries(PAPEL_DA_COLUNA).map(([coluna, papel]) => [papel, Boolean(tela[modulo]?.[coluna])])),
      },
    ]),
  );
}

/**
 * A matriz de permissões é o essencial (só ADMIN). O resto vem de outros
 * módulos: o que for recusado fica `null`, e aquela aba mantém o protótipo.
 */
const carregarConfiguracoes = async ({ sinal }) => {
  const opcional = (promessa) => promessa.catch(() => null);
  const [permissoes, grupos, sistema, usuarios, unidades, especialidades] = await Promise.all([
    api.buscarPermissoes({ sinal }),
    opcional(api.buscarConfiguracoes({ sinal })),
    opcional(api.buscarInformacoesDoSistema({ sinal })),
    opcional(api.listarUsuarios({ sinal })),
    opcional(api.listarUnidades({ sinal })),
    opcional(api.listarEspecialidades({ sinal })),
  ]);
  return { permissoes, grupos, sistema, usuarios, unidades, especialidades };
};

/** `GET /api/admin/sistema` → pares do cartão "Informações do Sistema". */
function informacoesDoSistema(s) {
  return [
    { rotulo: "Versão do sistema", valor: s.versao ?? "—" },
    { rotulo: "Banco de dados", valor: s.banco },
    { rotulo: "Última migração", valor: s.ultimaMigracao ? `V${s.ultimaMigracao.versao} – ${s.ultimaMigracao.descricao}` : "—" },
    { rotulo: "No ar desde", valor: dataHoraBr(s.noArDesde) },
    { rotulo: "Fuso horário", valor: s.fusoHorario },
  ];
}

export function ConfiguracoesDoAdmin() {
  const { usuario } = useAuth();
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarConfiguracoes);
  const retorno = useRetorno();
  const [vendoLogs, definirVendoLogs] = useState(false);
  const comApi = origem === "api" && dados;
  const aoConcluir = (texto) => {
    retorno.sucesso(texto);
    recarregar();
  };
  const usuarios = useEdicaoDeUsuarios({
    especialidades: dados?.especialidades ?? [],
    unidades: dados?.unidades ?? [],
    podeCriarAdmin: usuario?.role === "ADMIN",
    aoConcluir,
  });
  const unidades = useEdicaoDeUnidades({ aoConcluir });

  // A aba de usuários mostra a equipe e os médicos; pacientes ficam na tela de Usuários.
  const equipe = dados?.usuarios?.conteudo.filter((u) => u.papel !== "PACIENTE") ?? null;
  const contaDaEquipe = (linha) => equipe.find((u) => u.id === linha.id);
  const unidadeDaApi = (linha) => dados.unidades.find((u) => u.id === linha.id);
  const cadastrosDaConfiguracao = dados?.unidades?.map(paraUnidadeDaConfiguracao) ?? null;

  return (
    <>
      <AdminConfiguracoesPage
        // Remonta quando os dados chegam: as abas guardam o formulário em estado próprio.
        key={comApi ? "api" : "mocks"}
        aviso={
          <>
            <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
            {retorno.aviso}
          </>
        }
        propsDasAbas={
          comApi
            ? {
                geral: {
                  valores: dados.grupos?.gerais,
                  informacoes: dados.sistema ? informacoesDoSistema(dados.sistema) : undefined,
                  aoSalvar: dados.grupos ? (grupo) => api.salvarConfiguracao("gerais", grupo) : undefined,
                },
                usuarios: {
                  permissoes: matrizDaTela(dados.permissoes),
                  aoSalvarPermissoes: async (tela) => {
                    await api.salvarPermissoes(matrizDaApi(tela, dados.permissoes));
                  },
                  ...(equipe
                    ? {
                        usuarios: equipe.map(paraUsuarioDaEquipe),
                        aoNovoUsuario: usuarios.novo,
                        aoEditar: (linha) => usuarios.editar(contaDaEquipe(linha)),
                        aoExcluir: (linha) => usuarios.excluir(contaDaEquipe(linha)),
                      }
                    : {}),
                },
                ...(cadastrosDaConfiguracao
                  ? {
                      clinicas: {
                        unidades: cadastrosDaConfiguracao,
                        filtrosUnidade: opcoesDe(cadastrosDaConfiguracao, "unidade", "Todas as unidades", "todas"),
                        aoNovaClinica: unidades.nova,
                        aoEditar: (linha) => unidades.editar(unidadeDaApi(linha)),
                        aoExcluir: (linha) => unidades.excluir(unidadeDaApi(linha)),
                      },
                    }
                  : {}),
                seguranca: { aoVerLogs: () => definirVendoLogs(true) },
              }
            : {}
        }
      />
      {comApi && (
        <>
          {usuarios.elementos}
          {unidades.elementos}
          <DialogoAuditoria aberto={vendoLogs} aoFechar={() => definirVendoLogs(false)} />
        </>
      )}
    </>
  );
}
