import DashboardMedico from "./DashboardMedico.jsx";
import PortaoDaApi from "../../../components/PortaoDaApi/PortaoDaApi.jsx";
import { usePainelMedico } from "../usePainelMedico.js";

/**
 * Painel do médico ligado à API.
 *
 * `DashboardMedico` continua sendo o componente de apresentação, sem saber de
 * onde os dados vêm. O sistema não usa dados de demonstração: enquanto a API
 * responde, aparece "Carregando…"; se ela falhar, o erro com "Tentar de novo".
 */
export default function PainelMedicoConectado({ data }) {
  const painel = usePainelMedico({ data });

  return (
    <PortaoDaApi estados={painel} carregando="Carregando seu painel…">
      {() => {
        const { dados } = painel;
        return (
          <DashboardMedico
            medico={dados.medico}
            // Médico ainda sem unidade vinculada: `null`, e a tela mostra o aviso.
            unidade={dados.unidade}
            agenda={dados.agenda}
            pacientes={dados.pacientes}
            exames={dados.examesPendentes}
            notificacoes={dados.notificacoes}
            dataReferencia={dados.dataReferencia}
          />
        );
      }}
    </PortaoDaApi>
  );
}
