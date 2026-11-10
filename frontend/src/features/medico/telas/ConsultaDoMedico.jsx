import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";

import {
  CampoDaTela,
  CartaoDaTela,
  ConteudoCarregado,
  Dados,
} from "../../../components/Telas.jsx";
import { useRetorno } from "../../../components/useRetorno.jsx";
import estilos from "../../../styles/telas.module.css";
import { ROTULO_MODALIDADE, ROTULO_STATUS_EXAME, dataBr } from "../../../utils/formatos.js";
import { useDadosDaApi } from "../../paciente/useDadosDaApi.js";
import StatusTag from "../components/StatusTag/StatusTag.jsx";
import { buscarConsulta, registrarAtendimento } from "../medico.api.js";
import LinkDestino from "../navegacao/LinkDestino.jsx";
import AcoesDaConsulta from "./AcoesDaConsulta.jsx";
import DialogoPedirExame from "./DialogoPedirExame.jsx";
import TelaDoMedico from "./TelaDoMedico.jsx";

const TIPO = { consulta: "Consulta", retorno: "Retorno", exame: "Exame" };

/** Detalhe da consulta: andamento, registro do atendimento e exames pedidos nela. */
export default function ConsultaDoMedico() {
  const { consultaId } = useParams();
  const carregar = useCallback(({ sinal }) => buscarConsulta(consultaId, { sinal }), [consultaId]);
  const consulta = useDadosDaApi(carregar);
  const retorno = useRetorno();
  const [pedindoExame, setPedindoExame] = useState(false);
  const c = consulta.dados;

  return (
    <TelaDoMedico
      titulo={c ? `Consulta de ${c.paciente.nome}` : "Consulta"}
      subtitulo={c ? `${dataBr(c.data)} às ${c.horario} · ${c.unidade.nome}` : undefined}
      voltar={{ destino: "consultas", rotulo: "Consultas" }}
    >
      {retorno.aviso}
      <ConteudoCarregado estado={consulta} carregando="Carregando a consulta…">
        {c && (
          <>
            <CartaoDaTela titulo="Dados da consulta" extra={<StatusTag status={c.status} />}>
              <Dados
                itens={[
                  ["Paciente", (
                    <LinkDestino key="p" destino="prontuario" parametros={{ pacienteId: c.paciente.id }} className={estilos.itemPrincipal}>
                      {c.paciente.nome}
                    </LinkDestino>
                  )],
                  ["Idade", c.paciente.idade != null ? `${c.paciente.idade} anos` : null],
                  ["Especialidade", c.especialidade.nome],
                  ["Tipo", TIPO[c.tipoAtendimento] ?? c.tipoAtendimento],
                  ["Modalidade", ROTULO_MODALIDADE[c.modalidade] ?? c.modalidade],
                  ["Duração", `${c.duracaoMin} min`],
                  ["Motivo informado", c.motivo],
                  ["Motivo do cancelamento", c.status === "cancelada" ? c.motivoCancelamento : undefined],
                ].filter(([, valor]) => valor !== undefined)}
              />
              <AcoesDaConsulta
                consulta={{ ...c, paciente: c.paciente.nome }}
                aoMudar={() => {
                  retorno.sucesso("Consulta atualizada.");
                  consulta.recarregar();
                }}
                aoErrar={retorno.erro}
              />
            </CartaoDaTela>

            {(c.status === "em_andamento" || c.status === "realizada") && (
              <Atendimento
                consulta={c}
                aoSalvar={() => {
                  retorno.sucesso(c.status === "em_andamento" ? "Atendimento registrado; a consulta foi encerrada." : "Registro atualizado.");
                  consulta.recarregar();
                }}
              />
            )}

            <CartaoDaTela
              titulo="Exames pedidos nesta consulta"
              extra={
                c.status !== "cancelada" && (
                  <button type="button" className={estilos.botaoSecundario} onClick={() => setPedindoExame(true)}>
                    Pedir exame
                  </button>
                )
              }
            >
              {c.exames.length ? (
                <ul className={estilos.lista}>
                  {c.exames.map((e) => (
                    <li key={e.id} className={estilos.item}>
                      <LinkDestino destino="exame" parametros={{ exameId: e.id }} className={estilos.itemPrincipal}>
                        {e.nome}
                      </LinkDestino>
                      <span className={estilos.itemSecundario}>
                        {ROTULO_STATUS_EXAME[e.status] ?? e.status}
                        {e.prazo ? ` · prazo ${dataBr(e.prazo)}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={estilos.vazio}>Nenhum exame pedido nesta consulta.</p>
              )}
            </CartaoDaTela>

            <DialogoPedirExame
              aberto={pedindoExame}
              aoFechar={() => setPedindoExame(false)}
              pacienteId={c.paciente.id}
              paciente={c.paciente.nome}
              agendamentoOrigemId={c.id}
              aoPedir={(exame) => {
                retorno.sucesso(`${exame.nome} pedido para ${c.paciente.nome}.`);
                consulta.recarregar();
              }}
            />
          </>
        )}
      </ConteudoCarregado>
    </TelaDoMedico>
  );
}

/** Resumo e desfecho. Numa consulta em andamento, salvar a encerra como realizada. */
function Atendimento({ consulta, aoSalvar }) {
  const [resumo, setResumo] = useState(consulta.resumo ?? "");
  const [desfecho, setDesfecho] = useState(consulta.desfecho ?? "");
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const salvar = async (evento) => {
    evento.preventDefault();
    if (!resumo.trim()) {
      setErros({ resumo: "Descreva o atendimento." });
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await registrarAtendimento(consulta.id, { resumo: resumo.trim(), desfecho: desfecho.trim() || undefined });
      setErros({});
      aoSalvar();
    } catch (falha) {
      setErros(falha.campos ?? {});
      setErro(falha.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <CartaoDaTela titulo="Registro do atendimento">
      <form onSubmit={salvar} noValidate className={estilos.formulario}>
        <CampoDaTela rotulo="Resumo" erro={erros.resumo} tipo="area">
          {(props) => <textarea maxLength={5000} rows={6} value={resumo} onChange={(e) => setResumo(e.target.value)} {...props} />}
        </CampoDaTela>
        <CampoDaTela rotulo="Desfecho e orientações (opcional)" erro={erros.desfecho} tipo="area">
          {(props) => <textarea maxLength={2000} rows={3} value={desfecho} onChange={(e) => setDesfecho(e.target.value)} {...props} />}
        </CampoDaTela>
        {erro && <p className={`${estilos.mensagem} ${estilos.erro}`} role="alert">{erro}</p>}
        <div className={estilos.botoes}>
          <button type="submit" className={estilos.botao} disabled={enviando}>
            {enviando ? "Salvando…" : consulta.status === "em_andamento" ? "Salvar e encerrar consulta" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </CartaoDaTela>
  );
}
