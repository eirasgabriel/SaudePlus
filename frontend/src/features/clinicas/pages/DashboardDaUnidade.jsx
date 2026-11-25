import { useCallback, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/auth.context.js';
import { useDadosDaApi } from '../../paciente/useDadosDaApi.js';
import * as api from '../clinica.api.js';
import DialogoConfirmacao from '../../../components/DialogoConfirmacao.jsx';
import PortaoDaApi from '../../../components/PortaoDaApi/PortaoDaApi.jsx';
import WelcomeBanner from '../../medico/components/WelcomeBanner/WelcomeBanner.jsx';
import SummaryCard from '../../medico/components/SummaryCard/SummaryCard.jsx';
import Panel from '../../medico/components/Panel/Panel.jsx';
import UnitCard from '../../medico/components/UnitCard/UnitCard.jsx';
import DayAgendaCard from '../../medico/components/DayAgendaCard/DayAgendaCard.jsx';
import StatusTag from '../../medico/components/StatusTag/StatusTag.jsx';
import AgendaFilter from '../../medico/components/AgendaList/AgendaFilter.jsx';
import agendaStyles from '../../medico/components/AgendaList/AgendaList.module.css';
import { contagemPorStatus, filtrarAgenda, proximasConsultas } from '../../medico/selectors.js';
import { BuildingIcon, CalendarIcon, UsersIcon, ClockIcon, StethoscopeIcon } from '../../../components/icons/Icons.jsx';
import { carregarClinicaLogada, carregarAgendaDaUnidade, dataValida, hojeNaClinica, profissionaisDoDia, resumoDaUnidade } from '../painelDaUnidade.js';
import styles from './DashboardDaUnidade.module.css';

const SITUACAO = { ativa: 'Ativa', manutencao: 'Em manutenção', inativa: 'Inativa' };

/** "2026-11-10" -> "terça-feira, 10 de novembro de 2026" (sem depender do fuso do navegador). */
const dataPorExtenso = (iso) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

/** Linha da agenda no formato do cartão "Agenda do dia" do médico. */
const paraCartaoDoDia = (consulta) => consulta && {
  horario: consulta.horario,
  paciente: consulta.paciente.nome,
  tipo: `${consulta.medico.nome} · ${consulta.especialidade}`,
};

/**
 * Painel da conta da unidade clínica (/clinica), no mesmo desenho dos painéis
 * do médico e da equipe: faixa de boas-vindas abrindo a coluna principal,
 * cartões de resumo, painéis em dupla e a coluna direita com a peça azul
 * (Agenda do dia). A unidade vem da conta; a recepção confirma, registra a
 * chegada e cancela consultas da própria agenda.
 */
export default function DashboardDaUnidade() {
  const cadastro = useDadosDaApi(carregarClinicaLogada);
  return (
    <PortaoDaApi estados={cadastro} carregando="Carregando a unidade clínica…">
      {() => <PainelDaUnidade {...cadastro.dados} />}
    </PortaoDaApi>
  );
}

function PainelDaUnidade({ unidades, modulos }) {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const prefixo = `uc-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const unidade = unidades[0];
  const data = dataValida(params.get('data')) ? params.get('data') : hojeNaClinica();
  const alterar = (campo, valor) => setParams((anteriores) => {
    const novos = new URLSearchParams(anteriores);
    novos.set(campo, valor);
    return novos;
  });

  const cabeca = (
    <>
      <WelcomeBanner
        nome={usuario?.nomeCompleto?.split(' ')[0] ?? 'equipe'}
        subtitulo={unidade
          ? `Acompanhe a rotina e os atendimentos de ${unidade.nome}.`
          : 'Acompanhe a rotina e os atendimentos da sua unidade clínica.'}
        imagem={null}
        tituloId={`${prefixo}-boas-vindas`}
      />
      <div className={styles.filtros} role="group" aria-label="Data do painel">
        <label className={styles.campo}>
          <span>Data da agenda</span>
          <input type="date" value={data} onChange={(e) => { if (dataValida(e.target.value)) alterar('data', e.target.value); }} />
        </label>
      </div>
    </>
  );

  if (!unidade) {
    return (
      <Grade cabeca={cabeca}>
        <Panel titulo="Unidade não encontrada" titleId={`${prefixo}-vazio`} icon={BuildingIcon}>
          <p className={styles.vazio}>Esta conta não está ligada a uma unidade ativa. Procure a administração do SaúdePlus.</p>
        </Panel>
      </Grade>
    );
  }

  const trilha = (cartaoDoDia) => (
    <ColunaDaUnidade unidade={unidade} prefixo={prefixo} cartaoDoDia={cartaoDoDia} />
  );

  if (!modulos.includes('agendamentos')) {
    return (
      <Grade cabeca={cabeca} trilha={trilha(null)}>
        <p className={styles.aviso} role="status">
          Seu perfil não tem acesso à agenda. Solicite o módulo de agendamentos à administração.
        </p>
      </Grade>
    );
  }

  // `key`: trocar unidade ou data remonta a rotina, sem mostrar a agenda anterior.
  return (
    <RotinaDaUnidade
      key={`${unidade.id}-${data}`}
      data={data}
      prefixo={prefixo}
      cabeca={cabeca}
      trilha={trilha}
    />
  );
}

/** Coluna principal + coluna direita, como em AdminDashboardPage e DashboardMedico. */
function Grade({ cabeca, trilha, children }) {
  return (
    <div className={styles.grade}>
      <div className={styles.conteudo}>
        {cabeca}
        {children}
      </div>
      {trilha && <aside className={styles.trilha} aria-label="Informações da unidade">{trilha}</aside>}
    </div>
  );
}

/**
 * O que a recepção pode fazer em cada consulta, como na agenda do admin:
 * confirmar a pendente, registrar a chegada da confirmada (só no dia ou
 * depois) e cancelar enquanto a consulta não começou.
 */
function acoesDaConsulta(consulta, data) {
  const acoes = [];
  if (consulta.status === 'pendente') acoes.push({ status: 'confirmada', rotulo: 'Confirmar' });
  if (consulta.status === 'confirmada' && data <= hojeNaClinica()) acoes.push({ status: 'aguardando', rotulo: 'Registrar chegada' });
  if (consulta.status === 'pendente' || consulta.status === 'confirmada') acoes.push({ status: 'cancelada', rotulo: 'Cancelar', perigo: true });
  return acoes;
}

const RESULTADO = { confirmada: 'confirmada', aguardando: 'com chegada registrada', cancelada: 'cancelada' };

function RotinaDaUnidade({ data, prefixo, cabeca, trilha }) {
  const [status, setStatus] = useState('todas');
  const [cancelando, setCancelando] = useState(null);
  const [retorno, setRetorno] = useState(null);
  const carregar = useCallback(
    ({ sinal }) => carregarAgendaDaUnidade({ data, sinal }),
    [data],
  );
  const agenda = useDadosDaApi(carregar);
  const consultas = useMemo(() => (agenda.origem === 'api' ? agenda.dados : []), [agenda.origem, agenda.dados]);
  const proximas = useMemo(() => proximasConsultas(consultas), [consultas]);
  const emAtendimento = consultas.find((c) => c.status === 'em_andamento') ?? null;
  const idAgenda = `${prefixo}-agenda`;

  const filtrar = (filtro) => {
    setStatus(filtro);
    document.getElementById(idAgenda)?.focus();
  };

  const mudarStatus = async (consulta, novo) => {
    setRetorno(null);
    await api.alterarStatusDoAgendamento(consulta.id, novo);
    setRetorno({ tom: 'status', texto: `Consulta de ${consulta.paciente.nome} ${RESULTADO[novo] ?? 'atualizada'}.` });
    agenda.recarregar();
  };

  const agir = async (consulta, acao) => {
    if (acao.status === 'cancelada') {
      setCancelando(consulta);
      return;
    }
    try {
      await mudarStatus(consulta, acao.status);
    } catch (falha) {
      setRetorno({ tom: 'alert', texto: falha.message ?? 'Não foi possível atualizar a consulta.' });
    }
  };

  const cartaoDoDia = agenda.origem === 'api' && (
    <DayAgendaCard
      data={dataPorExtenso(data)}
      atual={paraCartaoDoDia(emAtendimento)}
      proxima={paraCartaoDoDia(proximas[0])}
      restantes={proximas.length}
      tituloId={`${prefixo}-dia`}
      aoVerProximas={() => filtrar('pendentes')}
    />
  );

  return (
    <Grade cabeca={cabeca} trilha={trilha(cartaoDoDia)}>
      <PortaoDaApi estados={agenda} carregando="Carregando a agenda da unidade…">
        {() => {
          const resumo = resumoDaUnidade(consultas);
          const visiveis = filtrarAgenda(consultas, status);
          const profissionais = profissionaisDoDia(consultas);
          const cartoes = [
            { icon: CalendarIcon, tom: 'azul', rotulo: 'Consultas no dia', valor: resumo.consultas, filtro: 'todas' },
            { icon: UsersIcon, tom: 'verde', rotulo: 'Atendimentos realizados', valor: resumo.realizadas, filtro: 'realizada' },
            { icon: ClockIcon, tom: 'ambar', rotulo: 'Pacientes aguardando', valor: resumo.aguardando, filtro: 'aguardando' },
            { icon: StethoscopeIcon, tom: 'roxo', rotulo: 'Em atendimento', valor: resumo.emAtendimento, filtro: 'em_andamento' },
          ];
          return (
            <>
              <section className={styles.resumo} aria-labelledby={`${prefixo}-resumo`}>
                <h2 id={`${prefixo}-resumo`} className="sr-only">Resumo da unidade na data selecionada</h2>
                {cartoes.map(({ filtro, ...cartao }) => (
                  <SummaryCard key={filtro} {...cartao} apoio="na data selecionada" acao="Filtrar a agenda" aoClicar={() => filtrar(filtro)} />
                ))}
              </section>

              <div className={styles.dupla}>
                <Panel
                  titulo="Agenda da unidade"
                  titleId={idAgenda}
                  icon={CalendarIcon}
                  aside={(
                    <AgendaFilter
                      valor={status}
                      onChange={setStatus}
                      contagem={contagemPorStatus(consultas)}
                      total={consultas.length}
                      pendentes={proximas.length}
                    />
                  )}
                >
                  {retorno && <p className={styles.retorno} role={retorno.tom}>{retorno.texto}</p>}
                  <p className="sr-only" aria-live="polite">
                    {visiveis.length === 1 ? '1 consulta na lista' : `${visiveis.length} consultas na lista`}
                  </p>
                  {visiveis.length ? (
                    <ul className={agendaStyles.lista}>
                      {visiveis.map((c) => (
                        <li key={c.id} className={`${agendaStyles.item} ${styles.itemSemLink}`} data-status={c.status}>
                          <span className={agendaStyles.marcador} data-status={c.status} aria-hidden="true" />
                          <time className={agendaStyles.horario} dateTime={`${data}T${c.horario}`}>{c.horario}</time>
                          <div className={agendaStyles.info}>
                            <strong className={agendaStyles.paciente}>{c.paciente.nome}</strong>
                            <span className={agendaStyles.tipo}>{c.medico.nome} · {c.especialidade}</span>
                          </div>
                          <StatusTag status={c.status} />
                          {acoesDaConsulta(c, data).length > 0 && (
                            <span className={styles.acoesDaConsulta}>
                              {acoesDaConsulta(c, data).map((acao) => (
                                <button
                                  key={acao.status}
                                  type="button"
                                  className={acao.perigo ? styles.acaoPerigo : styles.acao}
                                  onClick={() => agir(c, acao)}
                                  aria-label={`${acao.rotulo}: ${c.paciente.nome}, ${c.horario}`}
                                >
                                  {acao.rotulo}
                                </button>
                              ))}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={agendaStyles.vazio}>
                      <p className={agendaStyles.vazioTitulo}>
                        {status === 'todas' ? 'Nenhuma consulta agendada para esta unidade nesta data.' : 'Nenhuma consulta neste filtro.'}
                      </p>
                      {status !== 'todas' && (
                        <button type="button" className={agendaStyles.vazioBotao} onClick={() => setStatus('todas')}>
                          Ver todas as consultas
                        </button>
                      )}
                    </div>
                  )}
                  <button className={styles.link} type="button" onClick={agenda.tentarDeNovo}>Atualizar agenda</button>
                </Panel>

                <Panel titulo="Profissionais com agenda no dia" titleId={`${prefixo}-profissionais`} icon={UsersIcon}>
                  {profissionais.length ? (
                    <ul className={styles.lista}>
                      {profissionais.map((p) => (
                        <li key={p.id} className={styles.linha}>
                          <div className={styles.pessoa}><strong>{p.nome}</strong><span>{p.especialidades}</span></div>
                          <span className={styles.numero}>{p.consultas === 1 ? '1 consulta' : `${p.consultas} consultas`}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className={styles.vazio}>Nenhum profissional com consultas ativas nesta data.</p>}
                </Panel>
              </div>
            </>
          );
        }}
      </PortaoDaApi>
      <DialogoConfirmacao
        aberto={Boolean(cancelando)}
        aoFechar={() => setCancelando(null)}
        titulo="Cancelar consulta"
        mensagem={cancelando ? `A consulta de ${cancelando.paciente.nome} às ${cancelando.horario} será cancelada e o paciente avisado.` : ''}
        rotuloConfirmar="Cancelar consulta"
        aoConfirmar={() => mudarStatus(cancelando, 'cancelada')}
      />
    </Grade>
  );
}

/** Coluna direita: Agenda do dia, dados da unidade e especialidades. */
function ColunaDaUnidade({ unidade, prefixo, cartaoDoDia }) {
  return (
    <>
      {cartaoDoDia}
      <Panel titulo="Unidade clínica" titleId={`${prefixo}-unidade`} icon={BuildingIcon}>
        <UnitCard unidade={{
          ...unidade,
          horario: unidade.horarioFuncionamento,
          endereco: [unidade.endereco, unidade.bairro, unidade.cidade, unidade.uf].filter(Boolean).join(', '),
        }} />
        <dl className={styles.dados}>
          <div><dt>Situação</dt><dd>{SITUACAO[unidade.status] ?? unidade.status}</dd></div>
          <div><dt>Médicos vinculados</dt><dd>{unidade.medicos}</dd></div>
          <div><dt>Agendamentos no mês</dt><dd>{unidade.agendamentosNoMes}</dd></div>
        </dl>
        {unidade.email && <a className={styles.link} href={`mailto:${unidade.email}`}>{unidade.email}</a>}
        <Link className={styles.link} to="/clinica/medicos">Gerenciar médicos da unidade →</Link>
        <Link className={styles.link} to="/clinica/conta">Editar contato da unidade →</Link>
      </Panel>
      <Panel titulo="Especialidades" titleId={`${prefixo}-especialidades`} icon={StethoscopeIcon}>
        {unidade.especialidades.length ? (
          <ul className={styles.lista}>
            {unidade.especialidades.map((e) => <li key={e} className={styles.linha}>{e}</li>)}
          </ul>
        ) : <p className={styles.vazio}>Nenhuma especialidade vinculada.</p>}
      </Panel>
    </>
  );
}
