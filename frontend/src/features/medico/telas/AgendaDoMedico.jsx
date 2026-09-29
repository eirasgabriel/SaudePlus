import { useCallback, useState } from "react";

import Dialogo from "../../../components/Dialogo.jsx";
import dlg from "../../../components/ModalAgendamento.module.css";
import { CampoDaTela, CartaoDaTela, ConteudoCarregado } from "../../../components/Telas.jsx";
import { useRetorno } from "../../../components/useRetorno.jsx";
import estilos from "../../../styles/telas.module.css";
import { DIAS_DA_SEMANA, ROTULO_MODALIDADE, dataHoraBr, hojeIso } from "../../../utils/formatos.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import StatusTag from "../components/StatusTag/StatusTag.jsx";
import { STATUS_CONSULTA } from "../data/medico.js";
import {
  buscarAgenda,
  alterarDisponibilidade,
  criarBloqueio,
  criarDisponibilidade,
  listarBloqueios,
  listarDisponibilidades,
  listarUnidades,
  removerBloqueio,
  removerDisponibilidade,
} from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import AcoesDaConsulta from "./AcoesDaConsulta.jsx";
import TelaDoMedico from "./TelaDoMedico.jsx";

const carregarConfiguracao = async ({ sinal }) => {
  const [disponibilidades, bloqueios, unidades] = await Promise.all([
    listarDisponibilidades({ sinal }),
    listarBloqueios({ sinal }),
    listarUnidades({ sinal }),
  ]);
  return { disponibilidades, bloqueios, unidades };
};

/** "Minha agenda": as consultas de um dia, com o andamento de cada uma, e a configuração da agenda. */
export default function AgendaDoMedico() {
  const retorno = useRetorno();
  return (
    <TelaDoMedico titulo="Minha agenda" subtitulo="Consultas do dia, horários de atendimento e bloqueios.">
      {retorno.aviso}
      <ConsultasDoDia retorno={retorno} />
      <ConfiguracaoDaAgenda retorno={retorno} />
    </TelaDoMedico>
  );
}

function ConsultasDoDia({ retorno }) {
  const [data, setData] = useState(() => hojeIso());
  const [status, setStatus] = useState("todas");
  const carregar = useCallback(({ sinal }) => buscarAgenda({ data, status, sinal }), [data, status]);
  const agenda = useDadosDaApi(carregar);

  return (
    <CartaoDaTela
      titulo="Consultas do dia"
      extra={
        <div className={estilos.filtros}>
          <CampoDaTela rotulo="Dia">
            {(props) => <input type="date" value={data} onChange={(e) => setData(e.target.value || hojeIso())} {...props} />}
          </CampoDaTela>
          <CampoDaTela rotulo="Status" tipo="select">
            {(props) => (
              <select value={status} onChange={(e) => setStatus(e.target.value)} {...props}>
                <option value="todas">Todas</option>
                {Object.entries(STATUS_CONSULTA).map(([chave, { rotulo }]) => (
                  <option key={chave} value={chave}>{rotulo}</option>
                ))}
              </select>
            )}
          </CampoDaTela>
        </div>
      }
    >
      <ConteudoCarregado estado={agenda} carregando="Carregando a agenda…">
        {agenda.dados?.length ? (
          <ul className={estilos.lista}>
            {agenda.dados.map((consulta) => (
              <li key={consulta.id} className={estilos.item}>
                <div className={estilos.itemTexto}>
                  <LinkDestino destino="consulta" parametros={{ consultaId: consulta.id }} className={estilos.itemPrincipal}>
                    {consulta.horario} · {consulta.paciente}
                  </LinkDestino>
                  <span className={estilos.itemSecundario}>
                    {consulta.tipo} · {ROTULO_MODALIDADE[consulta.modalidade] ?? consulta.modalidade}
                  </span>
                </div>
                <div className={estilos.botoes}>
                  <StatusTag status={consulta.status} />
                  {consulta.status === "em_andamento" ? (
                    <LinkDestino destino="consulta" parametros={{ consultaId: consulta.id }} className={estilos.botao}>
                      Registrar atendimento
                    </LinkDestino>
                  ) : (
                    <AcoesDaConsulta
                      consulta={consulta}
                      aoMudar={(atualizada) => {
                        retorno.sucesso(`Consulta de ${atualizada.paciente} atualizada.`);
                        agenda.recarregar();
                      }}
                      aoErrar={retorno.erro}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={estilos.vazio}>Nenhuma consulta neste dia{status !== "todas" ? " com esse status" : ""}.</p>
        )}
      </ConteudoCarregado>
    </CartaoDaTela>
  );
}

const JANELA_VAZIA = { unidadeId: "", diaSemana: "1", inicio: "08:00", fim: "12:00", duracaoMin: "30", modalidade: "presencial" };
const BLOQUEIO_VAZIO = { inicio: "", fim: "", motivo: "" };

function ConfiguracaoDaAgenda({ retorno }) {
  const config = useDadosDaApi(carregarConfiguracao);
  const [novaJanela, setNovaJanela] = useState(null);
  const [novoBloqueio, setNovoBloqueio] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const unidadesAtivas = config.dados?.unidades.filter((u) => u.status === "ativa") ?? [];

  const abrirJanela = () => {
    setErros({});
    setErroGeral(null);
    setNovaJanela({ ...JANELA_VAZIA, unidadeId: unidadesAtivas[0]?.id ?? "" });
  };

  const abrirBloqueio = () => {
    setErros({});
    setErroGeral(null);
    setConfirmarCancelamento(false);
    setNovoBloqueio(BLOQUEIO_VAZIO);
  };

  const editarJanela = (janela) => {
    setErros({});
    setErroGeral(null);
    setNovaJanela({ ...janela, unidadeId: janela.unidade.id });
  };

  const salvarJanela = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    try {
      const corpo = {
        unidadeId: novaJanela.unidadeId,
        inicio: novaJanela.inicio,
        fim: novaJanela.fim,
        modalidade: novaJanela.modalidade,
        diaSemana: Number(novaJanela.diaSemana),
        duracaoMin: Number(novaJanela.duracaoMin),
      };
      if (novaJanela.id) await alterarDisponibilidade(novaJanela.id, corpo);
      else await criarDisponibilidade(corpo);
      setNovaJanela(null);
      retorno.sucesso(novaJanela.id ? "Horário de atendimento atualizado." : "Horário de atendimento incluído.");
      config.recarregar();
    } catch (falha) {
      setErros(falha.campos ?? {});
      setErroGeral(falha.message);
    } finally {
      setEnviando(false);
    }
  };

  const salvarBloqueio = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    try {
      const criado = await criarBloqueio(novoBloqueio, { cancelarAgendamentos: confirmarCancelamento });
      setNovoBloqueio(null);
      retorno.sucesso(
        criado.agendamentosCancelados
          ? `Bloqueio criado; ${criado.agendamentosCancelados} consulta(s) cancelada(s) e os pacientes avisados.`
          : "Bloqueio criado.",
      );
      config.recarregar();
    } catch (falha) {
      setErros(falha.campos ?? {});
      setErroGeral(falha.message);
      // 422 com consultas no período: a pessoa confirma e reenviamos cancelando.
      if (falha.status === 422) setConfirmarCancelamento(true);
    } finally {
      setEnviando(false);
    }
  };

  const remover = async (acao, texto) => {
    try {
      await acao();
      retorno.sucesso(texto);
      config.recarregar();
    } catch (falha) {
      retorno.erro(falha);
    }
  };

  const campoDaJanela = (nome, rotulo, props = {}) => (
    <div className={dlg.campo}>
      <label className={dlg.rotulo} htmlFor={`janela-${nome}`}>{rotulo}</label>
      <input
        id={`janela-${nome}`}
        className={`${dlg.input} ${erros[nome] ? dlg.campoInvalido : ""}`}
        value={novaJanela[nome]}
        onChange={(e) => setNovaJanela((atual) => ({ ...atual, [nome]: e.target.value }))}
        {...props}
      />
      {erros[nome] && <p className={dlg.erro}>{erros[nome]}</p>}
    </div>
  );

  return (
    <>
      <CartaoDaTela
        titulo="Horários de atendimento"
        extra={
          config.origem === "api" && (
            <button type="button" className={estilos.botaoSecundario} onClick={abrirJanela} disabled={!unidadesAtivas.length}>
              Incluir horário
            </button>
          )
        }
      >
        <ConteudoCarregado estado={config}>
          {config.dados?.disponibilidades.length ? (
            <ul className={estilos.lista}>
              {config.dados.disponibilidades.map((d) => (
                <li key={d.id} className={estilos.item}>
                  <div className={estilos.itemTexto}>
                    <span className={estilos.itemPrincipal}>
                      {DIAS_DA_SEMANA[d.diaSemana]}, {d.inicio} às {d.fim}
                    </span>
                    <span className={estilos.itemSecundario}>
                      {d.unidade.nome} · consultas de {d.duracaoMin} min · {ROTULO_MODALIDADE[d.modalidade] ?? d.modalidade}
                    </span>
                  </div>
                  <div className={estilos.botoes}>
                    <button type="button" className={estilos.botaoSecundario} onClick={() => editarJanela(d)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={estilos.botaoPerigo}
                      onClick={() => remover(() => removerDisponibilidade(d.id), "Horário removido. Consultas já marcadas não mudam.")}
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={estilos.vazio}>
              {unidadesAtivas.length
                ? "Nenhum horário cadastrado: os pacientes ainda não conseguem marcar com você."
                : "Você ainda não está vinculado a uma unidade ativa. Procure a administração."}
            </p>
          )}
        </ConteudoCarregado>
      </CartaoDaTela>

      <CartaoDaTela
        titulo="Bloqueios"
        extra={
          config.origem === "api" && (
            <button type="button" className={estilos.botaoSecundario} onClick={abrirBloqueio}>
              Bloquear período
            </button>
          )
        }
      >
        <ConteudoCarregado estado={config}>
          {config.dados?.bloqueios.length ? (
            <ul className={estilos.lista}>
              {config.dados.bloqueios.map((b) => (
                <li key={b.id} className={estilos.item}>
                  <div className={estilos.itemTexto}>
                    <span className={estilos.itemPrincipal}>
                      {dataHoraBr(b.inicio)} até {dataHoraBr(b.fim)}
                    </span>
                    {b.motivo && <span className={estilos.itemSecundario}>{b.motivo}</span>}
                  </div>
                  <button type="button" className={estilos.botaoPerigo} onClick={() => remover(() => removerBloqueio(b.id), "Bloqueio removido.")}>
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={estilos.vazio}>Nenhum bloqueio futuro.</p>
          )}
        </ConteudoCarregado>
      </CartaoDaTela>

      <Dialogo aberto={Boolean(novaJanela)} aoFechar={() => setNovaJanela(null)} titulo={novaJanela?.id ? "Editar horário de atendimento" : "Incluir horário de atendimento"}
        descricao="Os horários livres que o paciente vê saem destas janelas.">
        {novaJanela && (
          <form className={dlg.formulario} onSubmit={salvarJanela} noValidate>
            <div className={dlg.campo}>
              <label className={dlg.rotulo} htmlFor="janela-unidade">Unidade</label>
              <select id="janela-unidade" className={dlg.select} value={novaJanela.unidadeId}
                onChange={(e) => setNovaJanela((atual) => ({ ...atual, unidadeId: e.target.value }))}>
                {unidadesAtivas.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
            </div>
            <div className={dlg.campo}>
              <label className={dlg.rotulo} htmlFor="janela-dia">Dia da semana</label>
              <select id="janela-dia" className={dlg.select} value={novaJanela.diaSemana}
                onChange={(e) => setNovaJanela((atual) => ({ ...atual, diaSemana: e.target.value }))}>
                {DIAS_DA_SEMANA.slice(1).map((dia, i) => <option key={dia} value={i + 1}>{dia}</option>)}
              </select>
            </div>
            {campoDaJanela("inicio", "Início", { type: "time" })}
            {campoDaJanela("fim", "Fim", { type: "time" })}
            {campoDaJanela("duracaoMin", "Duração de cada consulta (min)", { type: "number", min: 5, max: 240 })}
            <div className={dlg.campo}>
              <label className={dlg.rotulo} htmlFor="janela-modalidade">Modalidade</label>
              <select id="janela-modalidade" className={dlg.select} value={novaJanela.modalidade}
                onChange={(e) => setNovaJanela((atual) => ({ ...atual, modalidade: e.target.value }))}>
                {Object.entries(ROTULO_MODALIDADE).map(([chave, rotulo]) => <option key={chave} value={chave}>{rotulo}</option>)}
              </select>
            </div>
            {erroGeral && <p className={dlg.erro} role="alert">{erroGeral}</p>}
            <div className={dlg.acoes}>
              <button type="button" className={dlg.botaoSecundario} onClick={() => setNovaJanela(null)}>Cancelar</button>
              <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>{enviando ? "Salvando…" : novaJanela.id ? "Salvar alterações" : "Incluir"}</button>
            </div>
          </form>
        )}
      </Dialogo>

      <Dialogo aberto={Boolean(novoBloqueio)} aoFechar={() => setNovoBloqueio(null)} titulo="Bloquear período"
        descricao="Nenhum horário é oferecido dentro do bloqueio.">
        {novoBloqueio && (
          <form className={dlg.formulario} onSubmit={salvarBloqueio} noValidate>
            {["inicio", "fim"].map((nome) => (
              <div key={nome} className={dlg.campo}>
                <label className={dlg.rotulo} htmlFor={`bloqueio-${nome}`}>{nome === "inicio" ? "Início" : "Fim"}</label>
                <input
                  id={`bloqueio-${nome}`}
                  type="datetime-local"
                  className={`${dlg.input} ${erros[nome] ? dlg.campoInvalido : ""}`}
                  value={novoBloqueio[nome]}
                  onChange={(e) => {
                    setConfirmarCancelamento(false);
                    setNovoBloqueio((atual) => ({ ...atual, [nome]: e.target.value }));
                  }}
                />
                {erros[nome] && <p className={dlg.erro}>{erros[nome]}</p>}
              </div>
            ))}
            <div className={dlg.campo}>
              <label className={dlg.rotulo} htmlFor="bloqueio-motivo">Motivo (opcional)</label>
              <input id="bloqueio-motivo" className={dlg.input} maxLength={200} value={novoBloqueio.motivo}
                onChange={(e) => setNovoBloqueio((atual) => ({ ...atual, motivo: e.target.value }))} />
            </div>
            {erroGeral && <p className={dlg.erro} role="alert">{erroGeral}</p>}
            {confirmarCancelamento && (
              <p className={dlg.aviso}>Confirme de novo para bloquear e cancelar as consultas do período. Os pacientes serão avisados.</p>
            )}
            <div className={dlg.acoes}>
              <button type="button" className={dlg.botaoSecundario} onClick={() => setNovoBloqueio(null)}>Cancelar</button>
              <button type="submit" className={dlg.botaoPrimario} disabled={enviando}>
                {enviando ? "Salvando…" : confirmarCancelamento ? "Bloquear e cancelar consultas" : "Bloquear"}
              </button>
            </div>
          </form>
        )}
      </Dialogo>
    </>
  );
}
