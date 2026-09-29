import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import PacienteDashboard from "../../../components/PacienteDashboard";
import ConsultasPage from "../../../pages/ConsultasPage";
import ExamesPage from "../../../pages/ExamesPage";
import HistoricoPage from "../../../pages/HistoricoPage";
import ClinicasPage from "../../../pages/ClinicasPage";
import ModalAgendamento from "../../../components/ModalAgendamento";
import AvisoDeOrigem from "../../medico/components/AvisoDeOrigem/AvisoDeOrigem.jsx";
import AvisoDeSucesso from "../components/AvisoDeSucesso.jsx";
import { useDadosDaApi } from "../useDadosDaApi.js";
import { paraAtendimento, paraConsulta, paraExame, paraPaciente, paraUnidade } from "../adaptadores.js";
import {
  avaliarConsulta,
  baixarResultadoDoExame,
  buscarHistorico,
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

/* Telas da área do paciente ligadas à API. Cada uma carrega os dados,
   converte para o formato que a tela já recebia dos mocks e, se a API não
   responder, deixa a tela usar os mocks e mostra a faixa de demonstração.
   As ações (agendar, cancelar, remarcar, avaliar) só existem com a API. */

const formatoQuando = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function descrever(data, horario) {
  const [ano, mes, dia] = data.split("-").map(Number);
  return `${formatoQuando.format(new Date(ano, mes - 1, dia))} às ${horario}`;
}

const carregarPainel = ({ sinal }) => buscarPainel({ sinal });
const carregarConsultas = ({ sinal }) => listarConsultas({ sinal });
const carregarExames = ({ sinal }) => listarExames({ sinal });
const carregarHistorico = ({ sinal }) => buscarHistorico({ sinal });
const carregarUnidades = ({ sinal }) => http.get("/api/publico/unidades", { sinal });

export function PainelDoPaciente() {
  const navegar = useNavigate();
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarPainel);

  const props =
    origem === "api" && dados
      ? {
          paciente: paraPaciente(dados.paciente),
          agendamentos: dados.proximasConsultas.map(paraConsulta),
          unidade: paraUnidade(dados.unidade),
          totalNotificacoes: dados.notificacoesNaoLidas,
        }
      : {};

  // Sem API, o dashboard mantém o comportamento de demonstração (não reserva nada).
  const confirmar =
    origem === "api"
      ? async (escolha) => {
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
        }
      : undefined;

  return (
    <>
      <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
      <PacienteDashboard {...props} aoConfirmarAgendamento={confirmar} />
    </>
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
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarConsultas);
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

  const comApi = origem === "api" && dados;
  return (
    <>
      <ConsultasPage
        {...(comApi ? { consultas: dados.map(paraConsulta) } : {})}
        aviso={
          <>
            <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
            <AvisoDeSucesso>{aviso}</AvisoDeSucesso>
          </>
        }
        aoCancelar={comApi ? cancelar : undefined}
        aoRemarcar={comApi ? setRemarcando : undefined}
      />
      <ModalAgendamento
        aberto={Boolean(remarcando)}
        aoFechar={() => setRemarcando(null)}
        aoConfirmar={confirmarRemarcacao}
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
      />
    </>
  );
}

export function ExamesDoPaciente() {
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarExames);
  const comApi = origem === "api" && dados;
  return (
    <>
      <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
      <ExamesPage
        {...(comApi ? { exames: dados.map(paraExame) } : {})}
        aoBaixarResultado={comApi ? (exame) => baixarResultadoDoExame(exame.id) : undefined}
      />
    </>
  );
}

export function HistoricoDoPaciente() {
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarHistorico);

  const avaliar = useCallback(
    async (atendimento, nota) => {
      await avaliarConsulta({ agendamentoId: atendimento.id, nota });
      recarregar();
    },
    [recarregar],
  );

  const comApi = origem === "api" && dados;
  return (
    <HistoricoPage
      {...(comApi ? { historico: dados.map(paraAtendimento) } : {})}
      aviso={<AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />}
      aoAvaliar={comApi ? avaliar : undefined}
    />
  );
}

export function ClinicasDoPaciente() {
  const { origem, dados, erro, recarregar } = useDadosDaApi(carregarUnidades);
  return (
    <ClinicasPage
      {...(origem === "api" && dados ? { unidades: dados.map(paraUnidadePublica) } : {})}
      aviso={<AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />}
    />
  );
}

/** Unidade da rota pública (endereço em partes) → formato de `mockUnit`. */
function paraUnidadePublica(unidade) {
  const rua = unidade.bairro ? `${unidade.endereco} – ${unidade.bairro}` : unidade.endereco;
  return paraUnidade({ ...unidade, endereco: `${rua}, ${unidade.cidade} - ${unidade.uf}` });
}
