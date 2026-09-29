import { useCallback } from "react";
import { useParams } from "react-router-dom";

import { CartaoDaTela, ConteudoCarregado, Dados } from "../../../components/Telas.jsx";
import { useRetorno } from "../../../components/useRetorno.jsx";
import estilos from "../../../styles/telas.module.css";
import { ROTULO_STATUS_EXAME, dataBr, dataHoraBr } from "../../../utils/formatos.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import { baixarResultadoDoExame, buscarExame } from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import TelaDoMedico from "./TelaDoMedico.jsx";

/** Detalhe de um exame pedido pelo médico, com o resultado para baixar quando liberado. */
export default function ExameDoMedico() {
  const { exameId } = useParams();
  const carregar = useCallback(({ sinal }) => buscarExame(exameId, { sinal }), [exameId]);
  const exame = useDadosDaApi(carregar);
  const retorno = useRetorno();
  const e = exame.dados;

  const baixar = async () => {
    try {
      await baixarResultadoDoExame(e.id);
    } catch (falha) {
      retorno.erro(falha);
    }
  };

  return (
    <TelaDoMedico
      titulo={e ? e.nome : "Exame"}
      subtitulo={e ? `${e.categoria} · ${e.paciente}` : undefined}
      voltar={{ destino: "exames", rotulo: "Exames" }}
    >
      {retorno.aviso}
      <ConteudoCarregado estado={exame} carregando="Carregando o exame…">
        {e && (
          <>
            <CartaoDaTela
              titulo="Andamento"
              extra={
                e.resultadoDisponivel && (
                  <button type="button" className={estilos.botao} onClick={baixar}>
                    Baixar resultado
                  </button>
                )
              }
            >
              <Dados
                itens={[
                  ["Paciente", (
                    <LinkDestino key="p" destino="prontuario" parametros={{ pacienteId: e.pacienteId }} className={estilos.itemPrincipal}>
                      {e.paciente}
                    </LinkDestino>
                  )],
                  ["Situação", ROTULO_STATUS_EXAME[e.status] ?? e.status],
                  ["Pedido em", dataHoraBr(e.solicitadoEm)],
                  ["Prazo", e.prazo ? dataBr(e.prazo) : "Sem prazo"],
                  ["Coleta", e.coletaEm ? dataHoraBr(e.coletaEm) : "Não agendada"],
                  ["Unidade da coleta", e.unidade?.nome],
                  ["Resultado liberado em", e.resultadoLiberadoEm ? dataHoraBr(e.resultadoLiberadoEm) : null],
                  ["Consulta de origem", e.agendamentoOrigemId ? (
                    <LinkDestino key="c" destino="consulta" parametros={{ consultaId: e.agendamentoOrigemId }} className={estilos.itemPrincipal}>
                      Abrir consulta
                    </LinkDestino>
                  ) : null],
                ]}
              />
            </CartaoDaTela>
            {e.preparo && (
              <CartaoDaTela titulo="Preparo">
                <p className={estilos.texto}>{e.preparo}</p>
              </CartaoDaTela>
            )}
          </>
        )}
      </ConteudoCarregado>
    </TelaDoMedico>
  );
}
