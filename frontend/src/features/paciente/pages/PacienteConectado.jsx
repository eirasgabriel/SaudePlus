import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import PacienteDashboard from "../../../components/PacienteDashboard";
import ConsultasPage from "../../../pages/ConsultasPage";
import ExamesPage from "../../../pages/ExamesPage";
import HistoricoPage from "../../../pages/HistoricoPage";
import ClinicasPage from "../../../pages/ClinicasPage";
import ModalAgendamento from "../../../components/ModalAgendamento";
import PortaoDaApi from "../../../components/PortaoDaApi/PortaoDaApi.jsx";
import AvisoDeSucesso from "../components/AvisoDeSucesso.jsx";
import { useDadosDaApi } from "../useDadosDaApi.js";
import { ocupadosDe, paraAtendimento, paraConsulta, paraExame, paraNotificacao, paraPaciente, paraUnidade } from "../adaptadores.js";
import {
  avaliarConsulta,
  baixarResultadoDoExame,
  buscarHistorico,
  buscarNotificacoes,
  buscarPainel,
  cancelarConsulta,
  listarConsultas,
  listarExames,
  remarcarConsulta,
  reservarConsulta,
} from "../paciente.api.js";
import { http } from "../../../services/http.js";
import { buscarProfissional, listarEspecialidades } from "../../profissionais/profissionais.api.js";
import { lerPedidoDeAgendamento } from "../../profissionais/perfil.js";

/* Telas da área do paciente ligadas à API. Cada uma carrega os dados e
   converte para o formato que a tela recebe. Não há dados de demonstração:
   enquanto a API responde, a tela mostra "Carregando…"; se ela falhar, o erro
   com "Tentar de novo" (PortaoDaApi). */

const VOLTAR_AO_PAINEL = { to: "/paciente", rotulo: "Voltar ao painel" };

const formatoQuando = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function descrever(data, horario) {
  const [ano, mes, dia] = data.split("-").map(Number);
  return `${formatoQuando.format(new Date(ano, mes - 1, dia))} às ${horario}`;
}

const carregarPainel = ({ sinal }) => buscarPainel({ sinal });
const carregarNotificacoes = ({ sinal }) => buscarNotificacoes({ sinal });
const carregarConsultas = ({ sinal }) => listarConsultas({ sinal });
const carregarExames = ({ sinal }) => listarExames({ sinal });
const carregarHistorico = ({ sinal }) => buscarHistorico({ sinal });
const carregarUnidades = ({ sinal }) => http.get("/api/publico/unidades", { sinal });

export function PainelDoPaciente() {
  const navegar = useNavigate();
  const painel = useDadosDaApi(carregarPainel);
  const { dados, recarregar } = painel;
  // O sino lista as notificações; se elas falharem, o painel abre com o sino vazio.
  const notificacoes = useDadosDaApi(carregarNotificacoes);

  const confirmar = async (escolha) => {
    await reservarConsulta({
      medicoId: escolha.profissionalId,
      especialidadeId: escolha.especialidadeId,
      data: escolha.data,
      horario: escolha.horario,
      modalidade: escolha.modalidade,
    });
    recarregar();
    navegar("/paciente/consultas", {
      state: {
        aviso: `Consulta com ${escolha.profissional} agendada para ${descrever(escolha.data, escolha.horario)}. Ela fica pendente até a clínica confirmar.`,
      },
    });
  };

  return (
    <PortaoDaApi estados={painel} carregando="Carregando seu painel…">
      {() => (
        <PacienteDashboard
          paciente={paraPaciente(dados.paciente)}
          consultas={dados.proximasConsultas.map(paraConsulta)}
          unidade={paraUnidade(dados.unidade)}
          notificacoes={(notificacoes.dados ?? []).map(paraNotificacao)}
          onConfirmar={confirmar}
        />
      )}
    </PortaoDaApi>
  );
}

/**
 * Pedido de agendamento vindo do perfil ou da busca
 * (`/paciente/consultas?agendar=<medicoId>&data=&horario=`): descobre a
 * especialidade do médico e devolve o `inicial` do modal. Com o médico fora do
 * ar ou sem especialidade conhecida, o modal abre em branco.
 */
function usePedidoDeAgendamento(ativo) {
  const [params, setParams] = useSearchParams();
  const pedido = lerPedidoDeAgendamento(params);
  const [resolvido, setResolvido] = useState({ chave: null, inicial: null });
  const chave = pedido && ativo ? `${pedido.medicoId}|${pedido.data}|${pedido.horario}` : null;

  useEffect(() => {
    if (!chave) return undefined;
    const [medicoId, data, horario] = chave.split("|");
    const controle = new AbortController();
    const sinal = controle.signal;
    Promise.all([buscarProfissional(medicoId, { sinal }), listarEspecialidades({ sinal })])
      .then(([medico, especialidades]) => {
        if (sinal.aborted) return;
        const slugs = medico.especialidades.map((e) => e.slug);
        const especialidade = especialidades.find((e) => slugs.includes(e.slug));
        setResolvido({
          chave,
          inicial: especialidade
            ? { especialidadeId: especialidade.id, profissionalId: medico.id, data, horario }
            : { data, horario },
        });
      })
      .catch(() => {
        if (!sinal.aborted) setResolvido({ chave, inicial: {} });
      });
    return () => controle.abort();
  }, [chave]);

  return {
    // Só abre depois de resolvido: o modal lê o `inicial` ao abrir.
    inicial: chave && resolvido.chave === chave ? resolvido.inicial : null,
    encerrar: () => setParams({}, { replace: true }),
  };
}

export function ConsultasDoPaciente() {
  const location = useLocation();
  const consultas = useDadosDaApi(carregarConsultas);
  const { origem, dados, recarregar } = consultas;
  const [remarcando, setRemarcando] = useState(null);
  const [aviso, setAviso] = useState(location.state?.aviso ?? null);
  const pedido = usePedidoDeAgendamento(origem === "api");

  const confirmarAgendamento = async (escolha) => {
    await reservarConsulta({
      medicoId: escolha.profissionalId,
      especialidadeId: escolha.especialidadeId,
      data: escolha.data,
      horario: escolha.horario,
      modalidade: escolha.modalidade,
    });
    setAviso(`Consulta com ${escolha.profissional} agendada para ${descrever(escolha.data, escolha.horario)}. Ela fica pendente até a clínica confirmar.`);
    recarregar();
  };

  const cancelar = useCallback(
    async (consulta) => {
      await cancelarConsulta(consulta.id);
      setAviso("Consulta cancelada.");
      recarregar();
    },
    [recarregar],
  );

  const confirmarRemarcacao = async (escolha) => {
    await remarcarConsulta(remarcando.id, {
      data: escolha.data,
      horario: escolha.horario,
      modalidade: escolha.modalidade,
    });
    setAviso(`Consulta remarcada para ${descrever(escolha.data, escolha.horario)}. Ela volta a ficar pendente até a clínica confirmar.`);
    recarregar();
  };

  return (
    <>
      <PortaoDaApi estados={consultas} carregando="Carregando suas consultas…" voltar={VOLTAR_AO_PAINEL}>
        {() => (
          <ConsultasPage
            consultas={dados.map(paraConsulta)}
            aviso={<AvisoDeSucesso>{aviso}</AvisoDeSucesso>}
            aoCancelar={cancelar}
            aoRemarcar={setRemarcando}
          />
        )}
      </PortaoDaApi>
      <ModalAgendamento
        aberto={Boolean(remarcando)}
        aoFechar={() => setRemarcando(null)}
        aoConfirmar={confirmarRemarcacao}
        ocupados={ocupadosDe((dados ?? []).map(paraConsulta), remarcando?.id)}
        fixo={
          remarcando && {
            especialidadeId: remarcando.especialidadeId,
            especialidade: remarcando.specialty,
            profissionalId: remarcando.medicoId,
            profissional: remarcando.professional,
          }
        }
      />
      <ModalAgendamento
        aberto={Boolean(pedido.inicial)}
        aoFechar={pedido.encerrar}
        aoConfirmar={confirmarAgendamento}
        inicial={pedido.inicial}
        ocupados={ocupadosDe((dados ?? []).map(paraConsulta))}
      />
    </>
  );
}

export function ExamesDoPaciente() {
  const exames = useDadosDaApi(carregarExames);
  return (
    <PortaoDaApi estados={exames} carregando="Carregando seus exames…" voltar={VOLTAR_AO_PAINEL}>
      {() => (
        <ExamesPage
          exames={exames.dados.map(paraExame)}
          aoBaixarResultado={(exame) => baixarResultadoDoExame(exame.id)}
        />
      )}
    </PortaoDaApi>
  );
}

export function HistoricoDoPaciente() {
  const historico = useDadosDaApi(carregarHistorico);
  const { recarregar } = historico;

  const avaliar = useCallback(
    async (atendimento, nota) => {
      await avaliarConsulta({ agendamentoId: atendimento.id, nota });
      recarregar();
    },
    [recarregar],
  );

  return (
    <PortaoDaApi estados={historico} carregando="Carregando seu histórico…" voltar={VOLTAR_AO_PAINEL}>
      {() => <HistoricoPage historico={historico.dados.map(paraAtendimento)} aoAvaliar={avaliar} />}
    </PortaoDaApi>
  );
}

export function ClinicasDoPaciente() {
  const unidades = useDadosDaApi(carregarUnidades);
  return (
    <PortaoDaApi estados={unidades} carregando="Carregando as clínicas…" voltar={VOLTAR_AO_PAINEL}>
      {() => <ClinicasPage clinicas={unidades.dados.map(paraUnidadePublica)} />}
    </PortaoDaApi>
  );
}

/** Unidade da rota pública (endereço em partes) → formato de `mockUnit`. */
function paraUnidadePublica(unidade) {
  const rua = unidade.bairro ? `${unidade.endereco} – ${unidade.bairro}` : unidade.endereco;
  return paraUnidade({ ...unidade, endereco: `${rua}, ${unidade.cidade} - ${unidade.uf}` });
}
