import { useId, useMemo, useState } from "react";

import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  BuildingIcon,
  StethoscopeIcon,
  ShieldHeartIcon,
} from "../../../components/icons/Icons.jsx";
import { FlaskIcon, BellIcon } from "../components/icons/MedicoIcons.jsx";

import DashboardLayout from "../layouts/DashboardLayout.jsx";
import WelcomeBanner from "../components/WelcomeBanner/WelcomeBanner.jsx";
import SummaryCard from "../components/SummaryCard/SummaryCard.jsx";
import Panel from "../components/Panel/Panel.jsx";
import AgendaList from "../components/AgendaList/AgendaList.jsx";
import AgendaFilter from "../components/AgendaList/AgendaFilter.jsx";
import PatientList from "../components/PatientList/PatientList.jsx";
import PendingExamList from "../components/PendingExamList/PendingExamList.jsx";
import NotificationList from "../components/NotificationList/NotificationList.jsx";
import UnitCard from "../components/UnitCard/UnitCard.jsx";
import DayAgendaCard from "../components/DayAgendaCard/DayAgendaCard.jsx";
import HighlightCard from "../components/HighlightCard/HighlightCard.jsx";

import { NavegacaoProvider } from "../navegacao/NavegacaoProvider.jsx";
import { irAtePainel } from "../foco.js";

import {
  AGENDA,
  DATA_REFERENCIA,
  EXAMES_PENDENTES,
  FRASE_DO_DIA,
  MEDICO,
  NOTIFICACOES,
  PACIENTES,
  UNIDADE,
} from "../data/medico.js";
import {
  agendaComPacientes,
  contagemPorStatus,
  dataPorExtenso,
  examesComPacientes,
  filtrarAgenda,
  resumoDoDia,
} from "../selectors.js";

import heroMedico from "../../../assets/images/hero-medico.jpg";
import styles from "./DashboardMedico.module.css";

const PACIENTES_NO_PAINEL = 5;

/* ============================================================================
   O QUE CADA CONTROLE DESTA TELA FAZ
   ============================================================================

   Funciona hoje, sem depender de tela nova:
   - os quatro cartões de resumo levam ao painel que resumem, já filtrado;
   - o filtro da agenda (inclusive "Próximas", o mesmo recorte do cartão);
   - o sino do cabeçalho desce até as Notificações;
   - o menu da conta, no avatar;
   - "Ver no mapa", que abre o endereço da unidade no Google Maps;
   - o telefone da unidade, que abre o discador.

   Reservado — abre o aviso dizendo o destino (veja `../rotas.js`):
   - os menus superior e lateral, e a marca;
   - "Ver agenda completa", "Ver todos" e "Ver todas";
   - clicar numa linha da agenda ou da lista de pacientes;
   - os itens do menu da conta;
   - o envio da busca do cabeçalho.

   ATIVAR ROTAS: nada nesta tela precisa mudar. Siga o passo a passo no
   cabeçalho de `../rotas.js` — os `irPara(...)` daqui passam a navegar.
   ========================================================================= */

/**
 * Dashboard do Médico — SaúdePlus.
 *
 * Sem props, usa os mocks de `../data/medico.js`. Na integração, passe os
 * dados da API mantendo o mesmo formato:
 *   <DashboardMedico medico={...} agenda={...} pacientes={...} />
 */
export default function DashboardMedico(props) {
  /* O provider precisa envolver o cabeçalho e a barra lateral, que também
     chamam `irPara`. Por isso o conteúdo fica num componente separado: um
     componente não consegue usar o contexto que ele mesmo cria. */
  return (
    <NavegacaoProvider>
      <PainelDoMedico {...props} />
    </NavegacaoProvider>
  );
}

function PainelDoMedico({
  medico = MEDICO,
  unidade = UNIDADE,
  agenda = AGENDA,
  pacientes = PACIENTES,
  exames = EXAMES_PENDENTES,
  notificacoes = NOTIFICACOES,
  dataReferencia = DATA_REFERENCIA,
  fraseDoDia = FRASE_DO_DIA,
  imagemBoasVindas = heroMedico,
}) {
  const prefixo = `dm-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ids = {
    boasVindas: `${prefixo}-boas-vindas`,
    resumo: `${prefixo}-resumo`,
    agenda: `${prefixo}-agenda`,
    pacientes: `${prefixo}-pacientes`,
    exames: `${prefixo}-exames`,
    dia: `${prefixo}-dia`,
    unidade: `${prefixo}-unidade`,
    notificacoes: `${prefixo}-notificacoes`,
  };

  const [statusFiltro, setStatusFiltro] = useState("todas");

  const agendaCompleta = useMemo(() => agendaComPacientes(agenda, pacientes), [agenda, pacientes]);
  const agendaVisivel = useMemo(
    () => filtrarAgenda(agendaCompleta, statusFiltro),
    [agendaCompleta, statusFiltro],
  );
  const contagem = useMemo(() => contagemPorStatus(agenda), [agenda]);
  const resumo = useMemo(() => resumoDoDia(agenda, exames), [agenda, exames]);
  const examesResolvidos = useMemo(() => examesComPacientes(exames, pacientes), [exames, pacientes]);

  const naoLidas = notificacoes.filter(({ lida }) => !lida).length;

  /** Atalho dos cartões: filtra a agenda e leva a pessoa até ela. */
  const verAgendaFiltradaPor = (filtro) => {
    setStatusFiltro(filtro);
    irAtePainel(ids.agenda);
  };

  /* Os cartões apontam para o painel que resumem, com o filtro que produz
     exatamente o número mostrado — clicar em "Pacientes atendidos: 3" deixa
     a agenda com 3 linhas, e não com um recorte parecido. */
  const cartoes = [
    {
      icon: CalendarIcon,
      tom: "azul",
      rotulo: "Consultas hoje",
      valor: resumo.consultasHoje,
      apoio: "Agendadas",
      acao: "Ver a agenda do dia",
      aoClicar: () => verAgendaFiltradaPor("todas"),
    },
    {
      icon: UsersIcon,
      tom: "verde",
      rotulo: "Pacientes atendidos",
      valor: resumo.pacientesAtendidos,
      apoio: `de ${resumo.consultasHoje}`,
      acao: "Ver as consultas já realizadas",
      aoClicar: () => verAgendaFiltradaPor("realizada"),
    },
    {
      icon: FlaskIcon,
      tom: "roxo",
      rotulo: "Exames pendentes",
      valor: resumo.examesPendentes,
      apoio: "para resultado",
      acao: "Ver os exames aguardando resultado",
      aoClicar: () => irAtePainel(ids.exames),
    },
    {
      icon: ClockIcon,
      tom: "ambar",
      rotulo: "Próximas consultas",
      valor: resumo.proximasConsultas,
      apoio: resumo.primeiroHorarioPendente
        ? `a partir das ${resumo.primeiroHorarioPendente}`
        : "nenhuma pendente",
      acao: "Ver as consultas que ainda não começaram",
      aoClicar: () => verAgendaFiltradaPor("pendentes"),
    },
  ];

  const colunaDireita = (
    <>
      <DayAgendaCard data={dataPorExtenso(dataReferencia)} frase={fraseDoDia} tituloId={ids.dia} />

      <Panel icon={BuildingIcon} titulo="Unidade" titleId={ids.unidade}>
        <UnitCard unidade={unidade} />
      </Panel>

      <Panel
        icon={BellIcon}
        titulo="Notificações"
        titleId={ids.notificacoes}
        acao={{ rotulo: "Ver todas", destino: "notificacoes" }}
      >
        <NotificationList notificacoes={notificacoes} />
      </Panel>

      <HighlightCard
        variante="linha"
        icon={ShieldHeartIcon}
        titulo={`Juntos por uma saúde melhor em ${unidade.cidade}!`}
      />
    </>
  );

  return (
    <DashboardLayout
      medico={medico}
      totalNotificacoes={naoLidas}
      idPainelNotificacoes={ids.notificacoes}
      aside={colunaDireita}
    >
      <WelcomeBanner
        nome={medico.nome}
        subtitulo="Aqui está um resumo da sua rotina de hoje."
        imagem={imagemBoasVindas}
        tituloId={ids.boasVindas}
      />

      <section className={styles.resumo} aria-labelledby={ids.resumo}>
        <h2 id={ids.resumo} className="sr-only">
          Resumo do dia
        </h2>
        {cartoes.map((cartao) => (
          <SummaryCard key={cartao.rotulo} {...cartao} />
        ))}
      </section>

      <div className={styles.dupla}>
        <Panel
          icon={CalendarIcon}
          titulo="Minha agenda de hoje"
          titleId={ids.agenda}
          acao={{ rotulo: "Ver agenda completa", destino: "agenda" }}
          aside={
            <AgendaFilter
              valor={statusFiltro}
              onChange={setStatusFiltro}
              contagem={contagem}
              total={agenda.length}
              pendentes={resumo.proximasConsultas}
            />
          }
        >
          <p className="sr-only" aria-live="polite">
            {agendaVisivel.length === 1
              ? "1 consulta na lista"
              : `${agendaVisivel.length} consultas na lista`}
          </p>
          <AgendaList
            consultas={agendaVisivel}
            statusAtivo={statusFiltro}
            onLimparFiltro={() => setStatusFiltro("todas")}
          />
        </Panel>

        <div className={styles.colunaLateral}>
          <Panel
            icon={UsersIcon}
            titulo="Seus pacientes"
            titleId={ids.pacientes}
            acao={{ rotulo: "Ver todos", destino: "pacientes" }}
          >
            <PatientList pacientes={pacientes} limite={PACIENTES_NO_PAINEL} />
          </Panel>

          <Panel
            icon={StethoscopeIcon}
            titulo="Exames pendentes"
            titleId={ids.exames}
            acao={{ rotulo: "Ver todos", destino: "exames" }}
          >
            <PendingExamList exames={examesResolvidos} />
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
