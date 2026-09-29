import DashboardMedico from "./DashboardMedico.jsx";
import AvisoDeOrigem from "../components/AvisoDeOrigem/AvisoDeOrigem.jsx";
import { usePainelMedico } from "../usePainelMedico.js";

/**
 * Painel do médico ligado à API.
 *
 * `DashboardMedico` continua sendo o componente de apresentação, sem saber de
 * onde os dados vêm — aqui só decidimos a fonte. Quando a API não responde, a
 * tela renderiza com os mocks e exibe um aviso, em vez de mostrar uma página
 * de erro para algo que é um painel de leitura.
 */
export default function PainelMedicoConectado({ data }) {
  const { origem, dados, erro, recarregar } = usePainelMedico({ data });

  // Sem resposta da API: os valores padrão do DashboardMedico já são os mocks.
  const props =
    origem === "api" && dados
      ? {
          medico: dados.medico,
          // Médico ainda sem unidade vinculada: `null`, e a tela mostra o aviso.
          unidade: dados.unidade,
          agenda: dados.agenda,
          pacientes: dados.pacientes,
          exames: dados.examesPendentes,
          notificacoes: dados.notificacoes,
          dataReferencia: dados.dataReferencia,
          fraseDoDia: dados.fraseDoDia,
        }
      : {};

  return (
    <>
      <AvisoDeOrigem origem={origem} erro={erro} aoTentarDeNovo={recarregar} />
      <DashboardMedico {...props} />
    </>
  );
}
